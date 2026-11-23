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

/** Maximum length of a caller-supplied `$regex` search pattern. */
export const MAX_SEARCH_REGEX_LENGTH = 100;

// A quantifier immediately after a group close, e.g. `(a+)+`.
const NESTED_QUANTIFIER_PATTERN = /[+*}?]\s*\)[\s]*[+*{?]/;

/**
 * Accept a search regex operand only when it stays within the length bound
 * and does not contain a nested quantifier. Both entity storage adapters
 * use the returned string.
 */
export function assertBoundedSearchRegex(operand: unknown): string {
  const pattern = typeof operand === "string" ? operand : String(operand);
  if (pattern.length > MAX_SEARCH_REGEX_LENGTH) {
    throw new Error(`Regex pattern exceeds maximum length of ${MAX_SEARCH_REGEX_LENGTH} characters`);
  }
  if (NESTED_QUANTIFIER_PATTERN.test(pattern)) {
    throw new Error("Regex pattern contains nested quantifiers which may cause catastrophic backtracking");
  }
  return pattern;
}
