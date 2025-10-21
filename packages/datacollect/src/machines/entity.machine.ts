import { createMachine, assign } from 'xstate'
import type { Entity } from '../entities/types'

export interface EntityContext {
  entity: Entity | null
  error: string | null
  validationErrors: Record<string, string[]>
  isDirty: boolean
}

export type EntityEvent =
  | { type: 'LOAD'; entityId: string }
  | { type: 'CREATE' }
  | { type: 'UPDATE'; data: Partial<Entity> }
  | { type: 'SAVE' }
  | { type: 'DELETE' }
  | { type: 'VALIDATE' }
  | { type: 'RESET' }
  | { type: 'RETRY' }

export const entityMachine = createMachine<EntityContext, EntityEvent>({
  id: 'entity',
  initial: 'idle',
  context: {
    entity: null,
    error: null,
    validationErrors: {},
    isDirty: false
  },
  states: {
    idle: {
      on: {
        LOAD: 'loading',
        CREATE: 'creating',
        RESET: {
          target: 'idle',
          actions: assign({
            entity: null,
            error: null,
            validationErrors: {},
            isDirty: false
          })
        }
      }
    },

    loading: {
      invoke: {
        src: 'loadEntity',
        onDone: {
          target: 'idle',
          actions: assign({
            entity: (_, event) => event.data,
            error: null
          })
        },
        onError: {
          target: 'error',
          actions: assign({
            error: (_, event) => event.data?.message || 'Failed to load entity'
          })
        }
      }
    },

    creating: {
      invoke: {
        src: 'validateEntity',
        onDone: {
          target: 'validating'
        },
        onError: {
          target: 'idle',
          actions: assign({
            validationErrors: (_, event) => event.data
          })
        }
      }
    },

    validating: {
      invoke: {
        src: 'persistEntity',
        onDone: {
          target: 'idle',
          actions: assign({
            entity: (_, event) => event.data,
            error: null,
            validationErrors: {},
            isDirty: false
          })
        },
        onError: {
          target: 'error',
          actions: assign({
            error: (_, event) => event.data?.message || 'Failed to save entity'
          })
        }
      }
    },

    updating: {
      on: {
        UPDATE: {
          actions: assign({
            entity: (context, event) => ({
              ...context.entity!,
              ...event.data,
              updatedAt: new Date().toISOString()
            }),
            isDirty: true
          })
        },
        SAVE: 'validating',
        RESET: 'idle'
      }
    },

    deleting: {
      invoke: {
        src: 'deleteEntity',
        onDone: {
          target: 'idle',
          actions: assign({
            entity: null,
            error: null
          })
        },
        onError: {
          target: 'error',
          actions: assign({
            error: (_, event) => event.data?.message || 'Failed to delete entity'
          })
        }
      }
    },

    error: {
      on: {
        RETRY: 'idle',
        RESET: {
          target: 'idle',
          actions: assign({
            error: null,
            validationErrors: {}
          })
        }
      }
    }
  },
  on: {
    UPDATE: {
      target: '.updating',
      cond: (context) => context.entity !== null
    },
    DELETE: '.deleting',
    VALIDATE: {
      target: '.creating',
      cond: (context) => context.isDirty
    }
  }
})