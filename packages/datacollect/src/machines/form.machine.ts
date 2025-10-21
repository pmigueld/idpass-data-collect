import { createMachine, assign } from 'xstate'

export interface FormContext {
  formData: Record<string, any>
  validationErrors: Record<string, string[]>
  isSubmitting: boolean
  isDirty: boolean
  isValid: boolean
  submitCount: number
}

export type FormEvent =
  | { type: 'FIELD_CHANGE'; field: string; value: any }
  | { type: 'FIELD_BLUR'; field: string }
  | { type: 'SUBMIT' }
  | { type: 'RESET' }
  | { type: 'SET_ERRORS'; errors: Record<string, string[]> }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'SET_VALUE'; field: string; value: any }

export const formMachine = createMachine<FormContext, FormEvent>({
  id: 'form',
  initial: 'editing',
  context: {
    formData: {},
    validationErrors: {},
    isSubmitting: false,
    isDirty: false,
    isValid: true,
    submitCount: 0
  },
  states: {
    editing: {
      on: {
        FIELD_CHANGE: {
          actions: assign({
            formData: (context, event) => ({
              ...context.formData,
              [event.field]: event.value
            }),
            isDirty: true
          })
        },
        FIELD_BLUR: {
          target: 'validating'
        },
        SUBMIT: {
          target: 'validating'
        },
        SET_VALUE: {
          actions: assign({
            formData: (context, event) => ({
              ...context.formData,
              [event.field]: event.value
            })
          })
        },
        RESET: {
          target: 'editing',
          actions: assign({
            formData: {},
            validationErrors: {},
            isDirty: false,
            isValid: true,
            submitCount: 0
          })
        }
      }
    },

    validating: {
      invoke: {
        src: 'validateForm',
        onDone: [
          {
            target: 'submitting',
            cond: (context) => Object.keys(context.validationErrors).length === 0
          },
          {
            target: 'editing'
          }
        ],
        onError: {
          target: 'editing',
          actions: assign({
            validationErrors: (_, event) => event.data
          })
        }
      }
    },

    submitting: {
      entry: assign({
        isSubmitting: true
      }),
      invoke: {
        src: 'submitForm',
        onDone: {
          target: 'success',
          actions: assign({
            isSubmitting: false,
            submitCount: (context) => context.submitCount + 1,
            isDirty: false
          })
        },
        onError: {
          target: 'error',
          actions: assign({
            isSubmitting: false,
            error: (_, event) => event.data?.message || 'Submission failed'
          })
        }
      }
    },

    success: {
      after: {
        2000: 'editing' // Auto reset after 2 seconds
      }
    },

    error: {
      on: {
        SUBMIT: 'validating',
        RESET: 'editing'
      }
    }
  },
  on: {
    SET_ERRORS: {
      actions: assign({
        validationErrors: (_, event) => event.errors
      })
    },
    CLEAR_ERRORS: {
      actions: assign({
        validationErrors: {}
      })
    }
  }
})