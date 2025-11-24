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

export const basicInfoFormSchema = {
  display: "form",
  components: [
    {
      type: "textfield",
      key: "name",
      label: "Collection Program Name",
      placeholder: "e.g., Field Survey 2025",
      validate: {
        required: true,
        minLength: 3,
        maxLength: 100,
      },
    },
    {
      type: "textarea",
      key: "description",
      label: "Description",
      placeholder: "Describe the purpose of this collection program",
      validate: {
        required: true,
        minLength: 10,
        maxLength: 500,
      },
    },
    {
      type: "textfield",
      key: "version",
      label: "Version",
      placeholder: "1.0.0",
      validate: {
        required: true,
        pattern: "^\\d+\\.\\d+\\.\\d+$",
      },
    },
  ],
}

export const entityFormSchema = {
  display: "form",
  components: [
    {
      type: "textfield",
      key: "formName",
      label: "Form Name",
      placeholder: "e.g., Site Assessment",
      validate: {
        required: true,
        minLength: 3,
      },
    },
    {
      type: "textarea",
      key: "formDescription",
      label: "Form Description",
      placeholder: "What data will this form collect?",
      validate: {
        required: true,
      },
    },
  ],
}

export const integrationFormSchema = {
  display: "form",
  components: [
    {
      type: "select",
      key: "integrationType",
      label: "External Integration",
      data: {
        values: [
          { label: "None", value: "none" },
          { label: "OpenFn", value: "openfn" },
          { label: "OpenSPP", value: "openspp" },
          { label: "Generic Mock", value: "generic_mock" },
        ],
      },
      validate: {
        required: true,
      },
    },
    {
      type: "select",
      key: "authType",
      label: "Authentication Type",
      data: {
        values: [
          { label: "None (Default)", value: "none" },
          { label: "Basic Auth", value: "basic" },
          { label: "Keycloak", value: "keycloak" },
          { label: "Auth0", value: "auth0" },
        ],
      },
      conditional: {
        show: true,
        when: "integrationType",
        eq: ["openfn", "openspp"],
      },
    },
    {
      type: "textfield",
      key: "webhookUrl",
      label: "Webhook URL",
      placeholder: "https://api.example.com/webhook",
      conditional: {
        show: true,
        when: "integrationType",
        eq: ["openfn", "openspp"],
      },
    },
  ],
}
