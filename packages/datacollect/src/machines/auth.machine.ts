import { createMachine, assign } from 'xstate'

export interface AuthContext {
  user: any | null
  tokens: {
    accessToken?: string
    refreshToken?: string
    idToken?: string
  } | null
  error: string | null
  isLoading: boolean
  isAuthenticated: boolean
}

export type AuthEvent =
  | { type: 'LOGIN'; username: string; password: string }
  | { type: 'LOGOUT' }
  | { type: 'REFRESH_TOKEN' }
  | { type: 'TOKEN_REFRESHED'; tokens: AuthContext['tokens'] }
  | { type: 'TOKEN_REFRESH_FAILED'; error: string }
  | { type: 'AUTH_ERROR'; error: string }
  | { type: 'CLEAR_ERROR' }

export const authMachine = createMachine<AuthContext, AuthEvent>({
  id: 'auth',
  initial: 'unauthenticated',
  context: {
    user: null,
    tokens: null,
    error: null,
    isLoading: false,
    isAuthenticated: false
  },
  states: {
    unauthenticated: {
      on: {
        LOGIN: 'authenticating'
      }
    },

    authenticating: {
      entry: assign({
        isLoading: true,
        error: null
      }),
      invoke: {
        src: 'authenticate',
        onDone: {
          target: 'authenticated',
          actions: assign({
            user: (_, event) => event.data.user,
            tokens: (_, event) => event.data.tokens,
            isAuthenticated: true,
            isLoading: false
          })
        },
        onError: {
          target: 'error',
          actions: assign({
            error: (_, event) => event.data?.message || 'Authentication failed',
            isLoading: false
          })
        }
      }
    },

    authenticated: {
      initial: 'idle',
      states: {
        idle: {
          on: {
            REFRESH_TOKEN: 'refreshing'
          }
        },

        refreshing: {
          invoke: {
            src: 'refreshTokens',
            onDone: {
              target: 'idle',
              actions: assign({
                tokens: (_, event) => event.data
              })
            },
            onError: {
              target: '#auth.error',
              actions: assign({
                error: (_, event) => event.data?.message || 'Token refresh failed'
              })
            }
          }
        }
      },
      on: {
        LOGOUT: {
          target: 'unauthenticated',
          actions: assign({
            user: null,
            tokens: null,
            isAuthenticated: false,
            error: null
          })
        }
      },
      // Auto-refresh token before expiry
      after: {
        300000: '.refreshing' // 5 minutes before expiry
      }
    },

    error: {
      on: {
        LOGIN: 'authenticating',
        CLEAR_ERROR: {
          actions: assign({
            error: null
          })
        }
      }
    }
  }
})