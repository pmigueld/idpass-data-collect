import { createMachine, assign } from 'xstate'

export interface SyncContext {
  pendingEvents: number
  conflicts: number
  lastSyncTime?: Date
  syncStatus: 'idle' | 'checking' | 'pushing' | 'pulling' | 'resolving_conflicts' | 'completed' | 'failed'
  error: string | null
  isOnline: boolean
}

export type SyncEvent =
  | { type: 'CHECK_CONNECTION' }
  | { type: 'SYNC' }
  | { type: 'PUSH' }
  | { type: 'PULL' }
  | { type: 'RESOLVE_CONFLICTS' }
  | { type: 'RETRY' }
  | { type: 'CANCEL' }
  | { type: 'CONNECTION_CHANGED'; isOnline: boolean }

export const syncMachine = createMachine<SyncContext, SyncEvent>({
  id: 'sync',
  initial: 'idle',
  context: {
    pendingEvents: 0,
    conflicts: 0,
    syncStatus: 'idle',
    error: null,
    isOnline: navigator?.onLine ?? true
  },
  states: {
    idle: {
      always: [
        {
          target: 'checking',
          cond: (context) => context.isOnline && context.pendingEvents > 0
        }
      ],
      on: {
        CHECK_CONNECTION: 'checking',
        SYNC: 'checking',
        CONNECTION_CHANGED: {
          actions: assign({
            isOnline: (_, event) => event.isOnline
          })
        }
      }
    },

    checking: {
      invoke: {
        src: 'checkSyncStatus',
        onDone: [
          {
            target: 'ready',
            cond: (context, event) => event.data.hasChanges
          },
          {
            target: 'idle'
          }
        ],
        onError: {
          target: 'error',
          actions: assign({
            error: (_, event) => event.data?.message || 'Failed to check sync status'
          })
        }
      }
    },

    ready: {
      on: {
        SYNC: 'pushing',
        CANCEL: 'idle'
      }
    },

    pushing: {
      invoke: {
        src: 'pushChanges',
        onDone: {
          target: 'pulling'
        },
        onError: {
          target: 'error',
          actions: assign({
            error: (_, event) => event.data?.message || 'Failed to push changes'
          })
        }
      }
    },

    pulling: {
      invoke: {
        src: 'pullChanges',
        onDone: [
          {
            target: 'resolving_conflicts',
            cond: (context, event) => event.data.conflicts > 0
          },
          {
            target: 'completed'
          }
        ],
        onError: {
          target: 'error',
          actions: assign({
            error: (_, event) => event.data?.message || 'Failed to pull changes'
          })
        }
      }
    },

    resolving_conflicts: {
      invoke: {
        src: 'resolveConflicts',
        onDone: {
          target: 'completed'
        },
        onError: {
          target: 'error',
          actions: assign({
            error: (_, event) => event.data?.message || 'Failed to resolve conflicts'
          })
        }
      }
    },

    completed: {
      entry: assign({
        syncStatus: 'completed',
        lastSyncTime: () => new Date(),
        pendingEvents: 0,
        conflicts: 0,
        error: null
      }),
      after: {
        2000: 'idle' // Auto transition back to idle after 2 seconds
      }
    },

    error: {
      on: {
        RETRY: 'idle',
        CANCEL: 'idle'
      }
    }
  }
})