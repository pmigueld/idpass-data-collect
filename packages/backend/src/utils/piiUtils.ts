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

export const PII_FIELD_PATTERNS = [
  "name", "firstName", "lastName", "middleName", "fullName",
  "email", "phone", "phoneNumber", "mobile", "telephone",
  "ssn", "socialSecurity", "passport", "idNumber",
  "address", "street", "city", "state", "zip", "postalCode",
  "bankAccount", "accountNumber", "creditCard", "cardNumber",
  "dateOfBirth", "birthDate", "age",
];

export function identifyPIIFields(entityData: Record<string, any>): string[] {
  const piiFields: string[] = [];

  for (const [key, value] of Object.entries(entityData)) {
    const lowerKey = key.toLowerCase();

    if (PII_FIELD_PATTERNS.some(pattern => lowerKey.includes(pattern.toLowerCase()))) {
      piiFields.push(key);
      continue;
    }

    if (typeof value === "string" && isEmail(value)) {
      piiFields.push(key);
      continue;
    }

    if (typeof value === "string" && isPhoneNumber(value)) {
      piiFields.push(key);
      continue;
    }
  }

  return piiFields;
}

export function anonymizePII(entityData: Record<string, any>, piiFields?: string[]): Record<string, any> {
  const fieldsToAnonymize = piiFields || identifyPIIFields(entityData);
  const anonymized = { ...entityData };

  for (const field of fieldsToAnonymize) {
    if (anonymized.hasOwnProperty(field)) {
      const value = anonymized[field];

      if (typeof value === "string") {
        if (isEmail(value)) {
          anonymized[field] = anonymizeEmail(value);
        } else if (isPhoneNumber(value)) {
          anonymized[field] = anonymizePhoneNumber(value);
        } else {
          anonymized[field] = `[REDACTED_${field.toUpperCase()}]`;
        }
      } else {
        anonymized[field] = `[REDACTED_${field.toUpperCase()}]`;
      }
    }
  }

  return anonymized;
}

function isEmail(value: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

function isPhoneNumber(value: string): boolean {
  const cleaned = value.replace(/[\s\-\(\)\.]/g, "");
  const phoneRegex = /^\+?[\d]{10,15}$/;
  return phoneRegex.test(cleaned);
}

function anonymizeEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "[REDACTED_EMAIL]";
  return `user@${domain}`;
}

function anonymizePhoneNumber(phone: string): string {
  const cleaned = phone.replace(/[\s\-\(\)\.]/g, "");
  if (cleaned.startsWith("+")) {
    const countryCode = cleaned.match(/^\+(\d{1,4})/)?.[1] || "";
    return `+${countryCode} [REDACTED]`;
  }
  return "[REDACTED_PHONE]";
} 
