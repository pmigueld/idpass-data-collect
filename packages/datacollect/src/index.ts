// New functional API exports
export * from './machines/entity.machine'
export * from './machines/sync.machine'
export * from './machines/auth.machine'
export * from './machines/form.machine'

// Storage adapters
export * from './storage/entities'
export * from './storage/adapters/indexeddb'

// Entity operations
export * from './entities/queries'
export * from './entities/commands'
export * from './entities/validation'
export * from './entities/types'

// Auth
export * from './auth/session'

// Sync
export * from './sync/internal'

// Utils
export * from './utils/crypto'
export * from './utils/errors'

// Main API
export * from './api'

// Re-export types for convenience
export type { Entity, EntityForm, EntityFilter } from './entities/types'
export type { User, Session, AuthTokens } from './auth/session'
export type { SyncContext, SyncEvent } from './machines/sync.machine'
export type { EntityContext, EntityEvent } from './machines/entity.machine'
export type { AuthContext, AuthEvent } from './machines/auth.machine'
export type { FormContext, FormEvent } from './machines/form.machine'
export type { DataCollectConfig } from './api'