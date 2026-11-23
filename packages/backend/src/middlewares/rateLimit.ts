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

import rateLimit, { type RateLimitRequestHandler } from "express-rate-limit";

const TEST_CEILING = 10_000;

export const RATE_LIMITS = {
  /** Unauthenticated token refresh. */
  refresh: { limit: 30, windowMs: 15 * 60 * 1000 },
  /** Unauthenticated liveness probe. */
  health: { limit: 120, windowMs: 60 * 1000 },
  /** Unauthenticated public artifact downloads. */
  artifacts: { limit: 60, windowMs: 15 * 60 * 1000 },
  /** Authenticated sync pull, push, and pull callback. */
  sync: { limit: 2000, windowMs: 60 * 1000 },
  /** Authenticated conflict list, get, and resolve. */
  conflicts: { limit: 300, windowMs: 60 * 1000 },
  /** Authenticated app-config create and update. */
  appConfigWrite: { limit: 30, windowMs: 15 * 60 * 1000 },
  /** Authenticated OpenSPP file parse and remote field fetch. */
  openSpp: { limit: 30, windowMs: 15 * 60 * 1000 },
} as const;

function isTestEnv(): boolean {
  return process.env.NODE_ENV === "test" || process.env.JEST_WORKER_ID !== undefined;
}

/**
 * IP-keyed limiter. Jest raises the ceiling so suites that call a route many
 * times are not rejected. Set `RATE_LIMIT_ENFORCE=1` to keep the configured limit.
 */
export function createIpRateLimiter(options: {
  limit: number;
  windowMs: number;
  message?: string;
}): RateLimitRequestHandler {
  const enforce = !isTestEnv() || process.env.RATE_LIMIT_ENFORCE === "1";
  return rateLimit({
    windowMs: options.windowMs,
    limit: enforce ? options.limit : Math.max(options.limit, TEST_CEILING),
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: options.message ?? "Too many requests, please try again later" },
  });
}
