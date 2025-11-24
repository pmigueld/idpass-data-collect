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

import { setup, assign } from "xstate"
import type {
  CollectionProgramDraft,
  EntityForm,
  FieldMapping,
  InternalAuthenticationConfig,
  ExternalAuthenticationConfig,
} from "../types"

interface CollectionProgramContext {
  draft: CollectionProgramDraft
  errors: Record<string, string>
  isValid: {
    basicInfo: boolean
    entityForms: boolean
  }
}

type CollectionProgramEvent =
  | { type: "UPDATE_BASIC_INFO"; data: CollectionProgramDraft["basicInfo"] }
  | { type: "UPDATE_INTERNAL_AUTH"; config: InternalAuthenticationConfig }
  | { type: "UPDATE_EXTERNAL_AUTH"; config: ExternalAuthenticationConfig }
  | { type: "ADD_ENTITY_FORM"; form: EntityForm }
  | { type: "REMOVE_ENTITY_FORM"; formId: string }
  | { type: "ADD_FIELD_MAPPING"; mapping: FieldMapping }
  | { type: "REMOVE_FIELD_MAPPING"; mappingId: string }
  | { type: "VALIDATE_BASIC_INFO" }
  | { type: "VALIDATE_ENTITY_FORMS" }
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  | { type: "GO_TO_STEP"; step: string }
  | { type: "SUBMIT" }
  | { type: "CANCEL" }
  | { type: "RESET" }

const validateSemanticVersion = (version: string) => {
  const semverRegex = /^\d+\.\d+\.\d+(-[a-zA-Z0-9]+)?(\+[a-zA-Z0-9]+)?$/
  return semverRegex.test(version)
}

const validateBasicInfo = (basicInfo: CollectionProgramDraft["basicInfo"]): boolean => {
  return !!(
    basicInfo.name &&
    basicInfo.description &&
    validateSemanticVersion(basicInfo.version) &&
    basicInfo.integrationService !== undefined &&
    basicInfo.internalAuthType
  )
}

const validateEntityForms = (forms: EntityForm[]): boolean => {
  return forms.length > 0 && forms.every((form) => form.name && form.formSchema)
}

export const collectionProgramMachine = setup({
  types: {
    context: {} as CollectionProgramContext,
    events: {} as CollectionProgramEvent,
  },
  guards: {
    canProceedToIntegration: ({ context }) => {
      return context.isValid.basicInfo && !!context.draft.basicInfo.integrationService
    },
    canProceedToEntityForms: ({ context }) => {
      return context.isValid.basicInfo
    },
    canProceedToFieldMapping: ({ context }) => {
      return context.isValid.basicInfo && context.isValid.entityForms
    },
    canSubmit: ({ context }) => {
      return context.isValid.basicInfo && context.isValid.entityForms
    },
  },
}).createMachine({
  id: "collectionProgram",
  initial: "basicInfo",
  context: {
    draft: {
      basicInfo: {
        name: "",
        description: "",
        version: "1.0.0",
        integrationService: null,
        internalAuthType: "none",
      },
      entityForms: [],
      fieldMappings: [],
      internalAuth: { type: "none" },
      externalAuth: { type: "none" },
    },
    errors: {},
    isValid: {
      basicInfo: false,
      entityForms: false,
    },
  },
  states: {
    basicInfo: {
      on: {
        UPDATE_BASIC_INFO: {
          actions: assign({
            draft: ({ context, event }) => ({
              ...context.draft,
              basicInfo: event.data,
            }),
            isValid: ({ context, event }) => ({
              ...context.isValid,
              basicInfo: validateBasicInfo(event.data),
            }),
          }),
        },
        VALIDATE_BASIC_INFO: {
          actions: assign({
            isValid: ({ context }) => ({
              ...context.isValid,
              basicInfo: validateBasicInfo(context.draft.basicInfo),
            }),
          }),
        },
        NEXT_STEP: [
          {
            guard: "canProceedToIntegration",
            target: "integrationService",
          },
          {
            guard: "canProceedToEntityForms",
            target: "entityForms",
          },
        ],
      },
    },
    integrationService: {
      on: {
        UPDATE_EXTERNAL_AUTH: {
          actions: assign({
            draft: ({ context, event }) => ({
              ...context.draft,
              externalAuth: event.config,
            }),
          }),
        },
        NEXT_STEP: {
          guard: "canProceedToEntityForms",
          target: "entityForms",
        },
        PREV_STEP: {
          target: "basicInfo",
        },
      },
    },
    entityForms: {
      on: {
        ADD_ENTITY_FORM: {
          actions: assign({
            draft: ({ context, event }) => ({
              ...context.draft,
              entityForms: [...context.draft.entityForms, event.form],
            }),
            isValid: ({ context, event }) => ({
              ...context.isValid,
              entityForms: validateEntityForms([...context.draft.entityForms, event.form]),
            }),
          }),
        },
        REMOVE_ENTITY_FORM: {
          actions: assign({
            draft: ({ context, event }) => ({
              ...context.draft,
              entityForms: context.draft.entityForms.filter((f) => f.id !== event.formId),
            }),
            isValid: ({ context, event }) => ({
              ...context.isValid,
              entityForms: validateEntityForms(
                context.draft.entityForms.filter((f) => f.id !== event.formId),
              ),
            }),
          }),
        },
        VALIDATE_ENTITY_FORMS: {
          actions: assign({
            isValid: ({ context }) => ({
              ...context.isValid,
              entityForms: validateEntityForms(context.draft.entityForms),
            }),
          }),
        },
        NEXT_STEP: {
          guard: "canProceedToFieldMapping",
          target: "fieldMapping",
        },
        PREV_STEP: [
          {
            guard: "canProceedToIntegration",
            target: "integrationService",
          },
          {
            target: "basicInfo",
          },
        ],
      },
    },
    fieldMapping: {
      on: {
        ADD_FIELD_MAPPING: {
          actions: assign({
            draft: ({ context, event }) => ({
              ...context.draft,
              fieldMappings: [...context.draft.fieldMappings, event.mapping],
            }),
          }),
        },
        REMOVE_FIELD_MAPPING: {
          actions: assign({
            draft: ({ context, event }) => ({
              ...context.draft,
              fieldMappings: context.draft.fieldMappings.filter((m) => m.id !== event.mappingId),
            }),
          }),
        },
        NEXT_STEP: {
          target: "review",
        },
        PREV_STEP: {
          target: "entityForms",
        },
      },
    },
    review: {
      on: {
        SUBMIT: {
          guard: "canSubmit",
          target: "submitting",
        },
        PREV_STEP: {
          target: "fieldMapping",
        },
      },
    },
    submitting: {
      on: {
        RESET: {
          target: "basicInfo",
          actions: assign({
            draft: {
              basicInfo: {
                name: "",
                description: "",
                version: "1.0.0",
                integrationService: null,
                internalAuthType: "none",
              },
              entityForms: [],
              fieldMappings: [],
              internalAuth: { type: "none" },
              externalAuth: { type: "none" },
            },
            errors: {},
            isValid: {
              basicInfo: false,
              entityForms: false,
            },
          }),
        },
      },
    },
  },
  on: {
    UPDATE_INTERNAL_AUTH: {
      actions: assign({
        draft: ({ context, event }) => ({
          ...context.draft,
          internalAuth: event.config,
        }),
      }),
    },
    GO_TO_STEP: {
      actions: ({ event }) => {
        // Transition handled by target state
      },
    },
    CANCEL: {
      target: ".basicInfo",
      actions: assign({
        draft: {
          basicInfo: {
            name: "",
            description: "",
            version: "1.0.0",
            integrationService: null,
            internalAuthType: "none",
          },
          entityForms: [],
          fieldMappings: [],
          internalAuth: { type: "none" },
          externalAuth: { type: "none" },
        },
        errors: {},
        isValid: {
          basicInfo: false,
          entityForms: false,
        },
      }),
    },
  },
})

