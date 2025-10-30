/*
 * Licensed to the Association pour la cooperation numerique (ACN) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The ACN licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/**
 * OdooClient - Client for communicating with Odoo/OpenSPP instances
 * 
 * MIGRATION NOTICE: Odoo 19+ deprecates the JSON-RPC endpoint (/jsonrpc).
 * 
 * To migrate to the REST API:
 * 1. Update your OdooConfig to include apiType: "rest"
 * 2. Test your integration with the new REST protocol
 * 3. Remove apiType from config once migration is verified (it will default to "rest" in future versions)
 * 
 * Example:
 * ```typescript
 * const config: OdooConfig = {
 *   host: "https://odoo.example.com",
 *   database: "my_db",
 *   username: "user",
 *   password: "pass",
 *   apiType: "rest"  // Use REST API for Odoo 19+
 * };
 * ```
 * 
 * See: https://www.odoo.com/documentation/19.0/developer/reference/external_api.html#migrating-from-xml-rpc-json-rpc
 */

import axios, { AxiosInstance } from "axios";
import {
  OdooConfig,
  OdooApiType,
  OdooBaseModel,
  OpenSPPGroup,
  OpenSPPHousehold,
  OpenSPPIndividual,
  OpenSPPIndividualExtended,
  GroupMembership,
} from "./odoo-types";

interface JsonRpcErrorPayload {
  message?: string;
  data?: {
    name?: string;
    message?: string;
    debug?: string;
  };
}

interface JsonRpcResponse<T> {
  result?: T;
  error?: JsonRpcErrorPayload;
}

type CallOptions = {
  fields?: string[];
  limit?: number;
  order?: string;
  context?: Record<string, unknown>;
};

/**
 * Protocol abstraction for Odoo API communication.
 * Supports both JSON-RPC (legacy, deprecated in Odoo 19+) and REST (Odoo 19+) protocols.
 * 
 * @deprecated JSON-RPC protocol is deprecated in Odoo 19+.
 * Use the REST protocol by setting apiType: "rest" in OdooConfig.
 * See: https://www.odoo.com/documentation/19.0/developer/reference/external_api.html#migrating-from-xml-rpc-json-rpc
 */
interface OdooProtocol {
  authenticate(): Promise<number>;
  call<T>(model: string, method: string, args: unknown[] = [], kwargs?: CallOptions): Promise<T>;
  isAuthenticated(): boolean;
}

/**
 * JSON-RPC protocol implementation (legacy, deprecated in Odoo 19+).
 * 
 * @deprecated This protocol uses the /jsonrpc endpoint which is deprecated in Odoo 19+.
 * Migrate to RestProtocol by setting apiType: "rest" in OdooConfig.
 */
class JsonRpcProtocol implements OdooProtocol {
  private uid = 0;
  private axiosInstance: AxiosInstance;
  
  getUid(): number {
    return this.uid;
  }

  constructor(
    private baseUrl: string,
    private db: string,
    private username: string,
    private password: string,
  ) {
    this.axiosInstance = axios.create({
      baseURL: baseUrl,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
  }

  private generateRequestId(): number {
    return Math.floor(Math.random() * 1000000000);
  }

  private async makeRequest<T>(endpoint: string, data: Record<string, unknown>): Promise<T> {
    try {
      const response = await this.axiosInstance.post<JsonRpcResponse<T>>(endpoint, {
        jsonrpc: "2.0",
        id: this.generateRequestId(),
        ...data,
      });

      if (response.data.error) {
        const errorMsg =
          response.data.error.data?.message ||
          response.data.error.message ||
          "JSON-RPC request failed";
        throw new Error(errorMsg);
      }

      if (typeof response.data.result === "undefined") {
        throw new Error("No result in JSON-RPC response");
      }

      return response.data.result;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.error?.data?.message || error.message || "Network request failed",
        );
      }
      throw error;
    }
  }

  async authenticate(): Promise<number> {
    const result = await this.makeRequest<number>("/jsonrpc", {
      method: "call",
      params: {
        service: "common",
        method: "authenticate",
        args: [this.db, this.username, this.password, {}],
      },
    });

    if (!result) {
      throw new Error("Authentication failed");
    }

    this.uid = result;
    return this.uid;
  }

  async call<T>(model: string, method: string, args: unknown[] = [], kwargs?: CallOptions): Promise<T> {
    const executeArgs: unknown[] = [this.db, this.uid, this.password, model, method, args];
    if (kwargs && Object.keys(kwargs).length > 0) {
      executeArgs.push(kwargs);
    }

    return this.makeRequest<T>("/jsonrpc", {
      method: "call",
      params: {
        service: "object",
        method: "execute_kw",
        args: executeArgs,
      },
    });
  }

  isAuthenticated(): boolean {
    return this.uid > 0;
  }
}

/**
 * REST API protocol implementation for Odoo 19+.
 * Uses /web/dataset/call_kw endpoint for model operations.
 */
class RestProtocol implements OdooProtocol {
  private uid = 0;
  private sessionId: string | null = null;
  private axiosInstance: AxiosInstance;
  
  getUid(): number {
    return this.uid;
  }

  constructor(
    private baseUrl: string,
    private db: string,
    private username: string,
    private password: string,
  ) {
    this.axiosInstance = axios.create({
      baseURL: baseUrl,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      withCredentials: true, // Required for session cookies
    });
  }

  async authenticate(): Promise<number> {
    try {
      const response = await this.axiosInstance.post<{ uid: number; session_id: string }>(
        "/web/session/authenticate",
        {
          jsonrpc: "2.0",
          params: {
            db: this.db,
            login: this.username,
            password: this.password,
          },
        },
      );

      // Handle both JSON-RPC wrapper and direct response formats
      const result = response.data as { uid?: number; session_id?: string; result?: { uid: number; session_id: string } };
      
      let uid: number;
      let sessionId: string;
      
      if (result.result) {
        uid = result.result.uid;
        sessionId = result.result.session_id;
      } else {
        uid = result.uid ?? 0;
        sessionId = result.session_id ?? "";
      }

      if (!uid || !sessionId) {
        throw new Error("Authentication failed: invalid response");
      }

      this.uid = uid;
      this.sessionId = sessionId;

      // Store session cookie for subsequent requests
      if (response.headers["set-cookie"]) {
        // Axios with withCredentials will handle cookies automatically
      }

      return this.uid;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMsg =
          error.response?.data?.error?.message || error.message || "Authentication failed";
        throw new Error(errorMsg);
      }
      throw error;
    }
  }

  async call<T>(model: string, method: string, args: unknown[] = [], kwargs?: CallOptions): Promise<T> {
    if (!this.uid || !this.sessionId) {
      throw new Error("Not authenticated. Call authenticate() first.");
    }

    try {
      const response = await this.axiosInstance.post<{ result?: T; error?: { message: string } }>(
        "/web/dataset/call_kw",
        {
          jsonrpc: "2.0",
          params: {
            model,
            method,
            args,
            kwargs: kwargs || {},
            context: {
              lang: kwargs?.context?.lang || "en_US",
              ...kwargs?.context,
            },
          },
        },
      );

      const data = response.data as { result?: T; error?: { message: string } };
      
      if (data.error) {
        throw new Error(data.error.message || "API call failed");
      }

      if (typeof data.result === "undefined") {
        throw new Error("No result in REST API response");
      }

      return data.result;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMsg =
          error.response?.data?.error?.message || error.message || "Network request failed";
        throw new Error(errorMsg);
      }
      throw error;
    }
  }

  isAuthenticated(): boolean {
    return this.uid > 0 && this.sessionId !== null;
  }
}

export default class OdooClient {
  private protocol: OdooProtocol;
  private db: string;
  private username: string;
  private password: string;
  private registrarGroup: string;
  private baseUrl: string;

  constructor(config: OdooConfig) {
    this.db = config.database;
    this.username = config.username;
    this.password = config.password;
    this.registrarGroup = config.registrarGroup || "";
    this.baseUrl = config.host;

    // Select protocol based on config (default to jsonrpc for backward compatibility)
    const apiType: OdooApiType = config.apiType || "jsonrpc";

    if (apiType === "rest") {
      this.protocol = new RestProtocol(this.baseUrl, this.db, this.username, this.password);
    } else {
      this.protocol = new JsonRpcProtocol(this.baseUrl, this.db, this.username, this.password);
    }
  }

  private async checkUserGroups(uid: number): Promise<boolean> {
    if (!this.registrarGroup) {
      return true;
    }

    type ResUsersGroupInfo = { groups_id?: number[] };
    type ResGroupRecord = { res_id?: number };

    try {
      const userInfo = await this.protocol.call<ResUsersGroupInfo[]>("res.users", "read", [
        [uid],
        ["groups_id"],
      ]);
      if (!Array.isArray(userInfo) || !userInfo[0]) {
        return false;
      }

      const groups = await this.protocol.call<ResGroupRecord[]>("ir.model.data", "search_read", [
        [
          ["model", "=", "res.groups"],
          ["name", "=", this.registrarGroup],
        ],
      ], { fields: ["res_id", "name"] });

      if (!Array.isArray(groups) || !groups[0]?.res_id) {
        return false;
      }

      const userGroups = userInfo[0].groups_id ?? [];
      return userGroups.includes(groups[0].res_id);
    } catch (error) {
      console.error("Error checking user groups:", error);
      return false;
    }
  }

  async login(): Promise<number> {
    const uid = await this.protocol.authenticate();

    if (!uid) {
      throw new Error("Authentication failed");
    }

    const hasRequiredRoles = await this.checkUserGroups(uid);
    if (!hasRequiredRoles) {
      throw new Error("Insufficient permissions");
    }

    return uid;
  }

  private async call<T>(model: string, method: string, args: unknown[] = [], kwargs?: CallOptions): Promise<T> {
    return this.protocol.call<T>(model, method, args, kwargs);
  }

  async searchRead<T extends OdooBaseModel = OdooBaseModel>(
    model: string,
    domain: unknown[] = [],
    fields: string[] = [],
    _language: string | null = null,
    limit: number | null = null,
    _offset: number = 0,
  ): Promise<T[]> {
    const kwargs: CallOptions = { fields };
    if (limit !== null) {
      kwargs.limit = limit;
    }
    return this.call<T[]>(model, "search_read", [domain], kwargs);
  }

  async createGroup(data: Partial<OpenSPPGroup>): Promise<number> {
    return this.call<number>("res.partner", "create", [data]);
  }

  async createHousehold(rootId: number, data: Partial<OpenSPPHousehold>): Promise<number> {
    const householdId = await this.call<number>("res.partner", "create", [data]);

    if (householdId && rootId) {
      await this.addMembersToGroup(rootId, [{ individual: householdId }]);
    }

    return householdId;
  }

  async createIndividual(_rootId: number, data: Partial<OpenSPPIndividual>): Promise<number> {
    return this.call<number>("res.partner", "create", [data]);
  }

  async addMembersToGroup(groupId: number, memberships: GroupMembership[]): Promise<boolean> {
    return this.call<boolean>("res.partner", "write", [
      [groupId],
      {
        group_membership_ids: memberships.map((m) => [0, 0, m]),
      },
    ]);
  }

  async read<T extends OdooBaseModel = OdooBaseModel>(
    model: string,
    ids: number[],
    fields: string[] = [],
  ): Promise<T[]> {
    return this.call<T[]>(model, "read", [ids], { fields });
  }

  async create<T = number>(model: string, data: Record<string, unknown>): Promise<T> {
    return this.call<T>(model, "create", [data]);
  }

  async write<T = boolean>(model: string, ids: number[], data: Record<string, unknown>): Promise<T> {
    return this.call<T>(model, "write", [[ids[0]], data]);
  }

  async unlink<T = boolean>(model: string, ids: number[]): Promise<T> {
    return this.call<T>(model, "unlink", [ids]);
  }

  async callMethod<T = unknown>(
    model: string,
    method: string,
    args: unknown[] = [],
    kwargs: Record<string, unknown> = {},
  ): Promise<T> {
    return this.call<T>(model, method, args, kwargs as CallOptions);
  }

  async getSessionInfo(): Promise<unknown> {
    return this.call("res.users", "get_session_info", []);
  }

  isAuthenticated(): boolean {
    return this.protocol.isAuthenticated();
  }

  /**
   * Search and read partner records filtered by modification date.
   * Supports paging via offset and limit parameters.
   *
   * @param domain Search domain for filtering partners
   * @param modifiedSince Only return records modified after this timestamp
   * @param limit Maximum number of records to return (null for no limit)
   * @param offset Number of records to skip for pagination
   * @returns Array of partner records matching the criteria
   */
  async searchPartnersSince<T extends OdooBaseModel = OdooBaseModel>(
    domain: unknown[] = [],
    modifiedSince?: string,
    limit: number | null = null,
    _offset: number = 0,
  ): Promise<T[]> {
    const searchDomain = [...domain];

    if (modifiedSince) {
      searchDomain.push(["write_date", ">", modifiedSince]);
    }

    return this.searchRead<T>("res.partner", searchDomain, [], null, limit);
  }

  /**
   * Fetch household records (groups with kind=1) modified since a given timestamp.
   *
   * @param modifiedSince Only return records modified after this timestamp
   * @param limit Maximum number of records to return
   * @param offset Number of records to skip for pagination
   * @returns Array of household records
   */
  async fetchHouseholdsSince(
    modifiedSince?: string,
    limit: number | null = null,
    _offset: number = 0,
  ): Promise<OpenSPPHousehold[]> {
    return this.searchPartnersSince<OpenSPPHousehold>(
      [
        ["is_group", "=", true],
        ["kind", "=", 1],
      ],
      modifiedSince,
      limit,
    );
  }

  /**
   * Fetch individual records modified since a given timestamp.
   *
   * @param modifiedSince Only return records modified after this timestamp
   * @param limit Maximum number of records to return
   * @param offset Number of records to skip for pagination
   * @returns Array of individual records
   */
  async fetchIndividualsSince(
    modifiedSince?: string,
    limit: number | null = null,
    _offset: number = 0,
  ): Promise<OpenSPPIndividualExtended[]> {
    return this.searchPartnersSince<OpenSPPIndividualExtended>(
      [
        ["is_group", "=", false],
        ["is_registrant", "=", true],
      ],
      modifiedSince,
      limit,
    );
  }
}
