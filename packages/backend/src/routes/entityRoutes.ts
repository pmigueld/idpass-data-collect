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

import { Router } from "express";
import { AuthenticatedRequest, authenticateJWT, createAuthAdminMiddleware } from "../middlewares/authentication";
import { asyncHandler } from "../middlewares/errorHandlers";
import { AppInstanceStore } from "../types";
import { SyncLevel } from "@idpass/data-collect-core";

export function createEntityRoutes(appInstanceStore: AppInstanceStore, userStore: any): Router {
  const router = Router();

  // Middleware to get app instance
  const getAppInstance = async (configId: string) => {
    const appInstance = await appInstanceStore.getAppInstance(configId);
    if (!appInstance) {
      throw new Error("App instance not found");
    }
    return appInstance;
  };

  // GET /api/entities - List all entities with filtering and pagination
  router.get(
    "/",
    authenticateJWT,
    asyncHandler(async (req, res) => {
      const { configId = "default", type, page = "1", limit = "50", search } = req.query;

      const appInstance = await getAppInstance(configId as string);
      const edm = appInstance.edm;

      // Build search criteria
      const criteria: any[] = [];
      if (type) {
        criteria.push({ type });
      }
      if (search) {
        criteria.push({
          $or: [
            { "data.name": { $regex: search, $options: "i" } },
            { name: { $regex: search, $options: "i" } }
          ]
        });
      }

      // Get entities
      const entities = await edm.searchEntities(criteria.length > 0 ? criteria : []);

      // Apply pagination
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = startIndex + limitNum;
      const paginatedEntities = entities.slice(startIndex, endIndex);

      res.json({
        entities: paginatedEntities,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: entities.length,
          pages: Math.ceil(entities.length / limitNum)
        }
      });
    })
  );

  // GET /api/entities/:guid - Get detailed entity information
  router.get(
    "/:guid",
    authenticateJWT,
    asyncHandler(async (req, res) => {
      const { guid } = req.params;
      const { configId = "default" } = req.query;

      const appInstance = await getAppInstance(configId as string);
      const edm = appInstance.edm;

      const entities = await edm.searchEntities([{ guid }]);
      const entity = entities.find(e => e.modified.guid === guid);

      if (!entity) {
        return res.status(404).json({ error: "Entity not found" });
      }

      res.json(entity);
    })
  );

  // GET /api/entities/:guid/events - Get event history for an entity (admin only)
  router.get(
    "/:guid/events",
    createAuthAdminMiddleware(userStore),
    asyncHandler(async (req, res) => {
      const { guid } = req.params;
      const { configId = "default" } = req.query;

      const appInstance = await getAppInstance(configId as string);
      const edm = appInstance.edm;

      // Get events for this entity
      const events = await edm.eventStore.getEvents();

      // Filter events for this specific entity
      const entityEvents = events.filter(event => event.entityGuid === guid);

      res.json(entityEvents);
    })
  );

  // GET /api/entities/:guid/audit-logs - Get audit trail for an entity (admin only)
  router.get(
    "/:guid/audit-logs",
    createAuthAdminMiddleware(userStore),
    asyncHandler(async (req, res) => {
      const { guid } = req.params;
      const { configId = "default" } = req.query;

      const appInstance = await getAppInstance(configId as string);
      const edm = appInstance.edm;

      const auditLogs = await edm.getAuditTrailByEntityGuid(guid);

      res.json(auditLogs);
    })
  );

  // GET /api/conflicts - List unresolved conflicts (admin only)
  router.get(
    "/conflicts",
    createAuthAdminMiddleware(userStore),
    asyncHandler(async (req, res) => {
      const { configId = "default" } = req.query;

      const appInstance = await getAppInstance(configId as string);
      const edm = appInstance.edm;

      // Get potential duplicates (conflicts)
      const conflicts = await edm.getPotentialDuplicates();

      res.json(conflicts);
    })
  );

  // POST /api/conflicts/:id/resolve - Resolve a specific conflict (admin only)
  router.post(
    "/conflicts/:id/resolve",
    createAuthAdminMiddleware(userStore),
    asyncHandler(async (req, res) => {
      const { id } = req.params;
      const { configId = "default", newItem, existingItem, shouldDeleteNewItem } = req.body;

      const appInstance = await getAppInstance(configId as string);
      const edm = appInstance.edm;

      // Resolve the conflict
      await edm.submitForm({
        guid: id,
        type: "resolve-duplicate",
        entityGuid: newItem,
        data: {
          duplicates: [{ entityGuid: newItem, duplicateGuid: existingItem }],
          shouldDelete: shouldDeleteNewItem
        },
        timestamp: new Date().toISOString(),
        userId: (req as AuthenticatedRequest).user?.id?.toString() || "admin",
        syncLevel: SyncLevel.LOCAL,
      });

      res.json({ status: "success" });
    })
  );

  return router;
} 