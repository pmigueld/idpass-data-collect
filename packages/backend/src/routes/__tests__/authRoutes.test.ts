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
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import express from "express";
import request from "supertest";
import { createAuthRoutes } from "../authRoutes";
import { AppInstanceStore, AppInstance } from "../../types";
import { EntityDataManager, AuthManager } from "@idpass/data-collect-core";

// Mock the app instance store
const mockAppInstanceStore: jest.Mocked<AppInstanceStore> = {
  initialize: jest.fn(),
  createAppInstance: jest.fn(),
  updateAppInstance: jest.fn(),
  loadEntityData: jest.fn(),
  getAppInstance: jest.fn(),
  clearAppInstance: jest.fn(),
  clearStore: jest.fn(),
  closeConnection: jest.fn(),
};

// Mock AuthManager
const mockAuthManager = {
  validateToken: jest.fn(),
  verifyCredentials: jest.fn(),
  getAuthConfigs: jest.fn(),
} as unknown as jest.Mocked<AuthManager>;

// Mock EntityDataManager
const mockEdm = {
  getAuthManager: jest.fn(),
} as unknown as jest.Mocked<EntityDataManager>;

const mockAppInstance: AppInstance = {
  configId: "default",
  edm: mockEdm,
};

describe("Auth Routes", () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use("/api/auth", createAuthRoutes(mockAppInstanceStore));

    // Reset mocks
    jest.clearAllMocks();
  });

  describe("POST /api/auth/verify", () => {
    describe("Username/Password Verification", () => {
      it("should verify valid username and password", async () => {
        mockAppInstanceStore.getAppInstance.mockResolvedValue(mockAppInstance);
        mockEdm.getAuthManager.mockReturnValue(mockAuthManager);
        mockAuthManager.getAuthConfigs.mockReturnValue([{ type: "keycloak", fields: {} }]);
        mockAuthManager.verifyCredentials.mockResolvedValue({
          valid: true,
          username: "Field Worker",
        });

        const response = await request(app)
          .post("/api/auth/verify")
          .send({
            username: "fieldworker",
            password: "test123",
          });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          valid: true,
          username: "Field Worker",
        });
        expect(mockAuthManager.verifyCredentials).toHaveBeenCalledWith("keycloak", "fieldworker", "test123");
      });

      it("should reject invalid username and password", async () => {
        mockAppInstanceStore.getAppInstance.mockResolvedValue(mockAppInstance);
        mockEdm.getAuthManager.mockReturnValue(mockAuthManager);
        mockAuthManager.getAuthConfigs.mockReturnValue([{ type: "keycloak", fields: {} }]);
        mockAuthManager.verifyCredentials.mockResolvedValue({
          valid: false,
          error: "Invalid credentials",
        });

        const response = await request(app)
          .post("/api/auth/verify")
          .send({
            username: "fieldworker",
            password: "wrong",
          });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          valid: false,
          error: "Invalid credentials",
        });
      });

      it("should return error when username is provided without password", async () => {
        const response = await request(app)
          .post("/api/auth/verify")
          .send({
            username: "fieldworker",
          });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          valid: false,
          error: "Both username and password must be provided",
        });
      });

      it("should return error when password is provided without username", async () => {
        const response = await request(app)
          .post("/api/auth/verify")
          .send({
            password: "test123",
          });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          valid: false,
          error: "Both username and password must be provided",
        });
      });
    });

    describe("Token Verification", () => {
      it("should verify valid token", async () => {
        mockAppInstanceStore.getAppInstance.mockResolvedValue(mockAppInstance);
        mockEdm.getAuthManager.mockReturnValue(mockAuthManager);
        mockAuthManager.getAuthConfigs.mockReturnValue([{ type: "keycloak", fields: {} }]);
        mockAuthManager.validateToken.mockResolvedValue(true);

        const response = await request(app)
          .post("/api/auth/verify")
          .send({
            token: "valid-token",
          });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          valid: true,
        });
        expect(mockAuthManager.validateToken).toHaveBeenCalledWith("keycloak", "valid-token");
      });

      it("should reject invalid token", async () => {
        mockAppInstanceStore.getAppInstance.mockResolvedValue(mockAppInstance);
        mockEdm.getAuthManager.mockReturnValue(mockAuthManager);
        mockAuthManager.getAuthConfigs.mockReturnValue([{ type: "keycloak", fields: {} }]);
        mockAuthManager.validateToken.mockResolvedValue(false);

        const response = await request(app)
          .post("/api/auth/verify")
          .send({
            token: "invalid-token",
          });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          valid: false,
          error: "Invalid token",
        });
      });
    });

    describe("Error Handling", () => {
      it("should return error when no credentials provided", async () => {
        const response = await request(app).post("/api/auth/verify").send({});

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          valid: false,
          error: "Either username/password or token must be provided",
        });
      });

      it("should return error when app instance not found", async () => {
        mockAppInstanceStore.getAppInstance.mockResolvedValue(null);

        const response = await request(app)
          .post("/api/auth/verify")
          .send({
            configId: "nonexistent",
            username: "test",
            password: "test",
          });

        expect(response.status).toBe(404);
        expect(response.body).toEqual({
          valid: false,
          error: "App instance not found",
        });
      });

      it("should return error when auth not configured", async () => {
        mockAppInstanceStore.getAppInstance.mockResolvedValue(mockAppInstance);
        mockEdm.getAuthManager.mockReturnValue(undefined);

        const response = await request(app)
          .post("/api/auth/verify")
          .send({
            username: "test",
            password: "test",
          });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          valid: false,
          error: "Authentication not configured for this app",
        });
      });

      it("should handle internal errors gracefully", async () => {
        mockAppInstanceStore.getAppInstance.mockRejectedValue(new Error("Database error"));

        const response = await request(app)
          .post("/api/auth/verify")
          .send({
            username: "test",
            password: "test",
          });

        expect(response.status).toBe(500);
      });
    });

    describe("Config ID Support", () => {
      it("should use default config when not specified", async () => {
        mockAppInstanceStore.getAppInstance.mockResolvedValue(mockAppInstance);
        mockEdm.getAuthManager.mockReturnValue(mockAuthManager);
        mockAuthManager.getAuthConfigs.mockReturnValue([{ type: "keycloak", fields: {} }]);
        mockAuthManager.verifyCredentials.mockResolvedValue({
          valid: true,
          username: "Test User",
        });

        await request(app)
          .post("/api/auth/verify")
          .send({
            username: "test",
            password: "test",
          });

        expect(mockAppInstanceStore.getAppInstance).toHaveBeenCalledWith("default");
      });

      it("should use specified config ID", async () => {
        mockAppInstanceStore.getAppInstance.mockResolvedValue(mockAppInstance);
        mockEdm.getAuthManager.mockReturnValue(mockAuthManager);
        mockAuthManager.getAuthConfigs.mockReturnValue([{ type: "keycloak", fields: {} }]);
        mockAuthManager.verifyCredentials.mockResolvedValue({
          valid: true,
          username: "Test User",
        });

        await request(app)
          .post("/api/auth/verify")
          .send({
            configId: "custom-app",
            username: "test",
            password: "test",
          });

        expect(mockAppInstanceStore.getAppInstance).toHaveBeenCalledWith("custom-app");
      });
    });
  });
});

