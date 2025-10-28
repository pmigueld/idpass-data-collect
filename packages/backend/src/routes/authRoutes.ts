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

import { Router } from "express";
import { asyncHandler } from "../middlewares/errorHandlers";
import { AppInstanceStore } from "../types";

export function createAuthRoutes(appInstanceStore: AppInstanceStore): Router {
  const router = Router();

  router.post(
    "/verify",
    asyncHandler(async (req, res) => {
      const { configId = "default", username, password, token } = req.body;

      // Validate request body
      if (!username && !password && !token) {
        return res.status(400).json({
          valid: false,
          error: "Either username/password or token must be provided"
        });
      }

      if ((username && !password) || (!username && password)) {
        return res.status(400).json({
          valid: false,
          error: "Both username and password must be provided"
        });
      }

      // Get app instance
      const appInstance = await appInstanceStore.getAppInstance(configId as string);
      if (!appInstance) {
        return res.status(404).json({
          valid: false,
          error: "App instance not found"
        });
      }

      const authManager = appInstance.edm.getAuthManager();
      if (!authManager) {
        return res.status(400).json({
          valid: false,
          error: "Authentication not configured for this app"
        });
      }

      try {
        // Handle token verification
        if (token) {
          // Try to validate token with each configured auth adapter
          const authConfigs = authManager.getAuthConfigs();
          
          for (const config of authConfigs) {
            const isValid = await authManager.validateToken(config.type, token);
            if (isValid) {
              // Token is valid, try to get user info
              // For now, we return success without username since validateToken doesn't return user info
              return res.json({
                valid: true
              });
            }
          }

          return res.json({
            valid: false,
            error: "Invalid token"
          });
        }

        // Handle username/password verification
        if (username && password) {
          // Try to verify credentials with each configured auth adapter
          const authConfigs = authManager.getAuthConfigs();
          
          for (const config of authConfigs) {
            const result = await authManager.verifyCredentials(config.type, username, password);
            if (result.valid) {
              return res.json({
                valid: true,
                username: result.username
              });
            }
          }

          return res.json({
            valid: false,
            error: "Invalid credentials"
          });
        }

        // Should not reach here due to earlier validation
        return res.status(400).json({
          valid: false,
          error: "Invalid request"
        });
      } catch (error) {
        console.error("Auth verification error:", error);
        return res.status(500).json({
          valid: false,
          error: "Internal server error during authentication"
        });
      }
    })
  );

  return router;
}

