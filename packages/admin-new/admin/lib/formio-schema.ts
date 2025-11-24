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

export const newCollectionProgramSchema = {
  display: "form",
  components: [
    {
      type: "textfield",
      key: "name",
      label: "Program Name",
      placeholder: "Enter collection program name",
      validate: {
        required: true,
        minLength: 3,
        maxLength: 100,
      },
      input: true,
    },
    {
      type: "textarea",
      key: "description",
      label: "Description",
      placeholder: "Describe the purpose and scope of this collection program",
      validate: {
        required: true,
        minLength: 10,
        maxLength: 500,
      },
      input: true,
    },
    {
      type: "select",
      key: "externalIntegration",
      label: "External Integration",
      placeholder: "Select an integration or leave blank",
      data: {
        values: [
          { label: "None", value: null },
          { label: "OpenFn", value: "OpenFn" },
          { label: "OpenSPP", value: "OpenSPP" },
          { label: "Generic Mock", value: "Generic Mock" },
        ],
      },
      input: true,
    },
    {
      type: "number",
      key: "formsCount",
      label: "Number of Forms",
      placeholder: "How many forms will this program contain?",
      validate: {
        required: true,
        min: 1,
        max: 100,
      },
      input: true,
    },
  ],
}
