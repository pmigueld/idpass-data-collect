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

import bodyParser from "body-parser";
import type { RequestHandler } from "express";

/**
 * JSON body parser.
 *
 * body-parser 2 leaves `req.body` undefined when the request has no body.
 * Callers that read `req.body` on GET routes (sync pull, conflict list)
 * expect an object, so this wrapper restores that empty object after a
 * parse that did not run and did not fail.
 */
export function jsonBody(options?: { limit?: string }): RequestHandler {
  const parser = bodyParser.json(options?.limit ? { limit: options.limit } : {});
  return (req, res, next) => {
    parser(req, res, (err) => {
      if (!err && req.body === undefined) {
        req.body = {};
      }
      next(err);
    });
  };
}
