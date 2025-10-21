// Main functional API for ID PASS DataCollect
import { createMachine, interpret } from 'xstate'
import { entityMachine } from './machines/entity.machine'
import { syncMachine } from './machines/sync.machine'
import { authMachine } from './machines/auth.machine'
import { formMachine } from './machines/form.machine'
import { createEntityCollection } from './storage/entities'
import { createEntityQueries, createEntityCommands } from './entities'
import { SessionManager } from './auth/session'
import { InternalSyncManager } from './sync/internal'
import type { RxDatabase } from 'rxdb'
import type { Entity, EntityForm, EntityFilter } from './entities/types'

// Configuration interface
export interface DataCollectConfig {
  storage: {
    type: 'indexeddb' | 'postgres'
    config: any
  }
  sync: {
    internal: {
      serverUrl: string
      apiKey?: string
      batchSize?: number
      retryAttempts?: number
      retryDelay?: number
    }
    external?: {
      adapters: Array<{
        type: 'openspp' | 'openfn'
        config: any
      }>
    }
  }
  auth: {
    sessionStorage?: 'localStorage' | 'sessionStorage' | 'memory'
    oidc?: {
      authority: string
      clientId: string
      redirectUri: string
    }
  }
}

// Main API class
export class DataCollectAPI {
  private db: RxDatabase | null = null
  private syncManager: InternalSyncManager | null = null
  private sessionManager: SessionManager
  private config: DataCollectConfig

  constructor(config: DataCollectConfig) {
    this.config = config
    this.sessionManager = SessionManager.getInstance()

    // Restore session if available
    this.sessionManager.restoreFromStorage()
  }

  // Initialize the API
  async initialize(): Promise<void> {
    try {
      // Initialize storage
      if (this.config.storage.type === 'indexeddb') {
        const { IndexedDbStorageAdapter } = await import('./storage/adapters/indexeddb')
        const adapter = new IndexedDbStorageAdapter(this.config.storage.config)
        await adapter.initialize()
        this.db = adapter.getDatabase()
      }

      // Initialize sync manager
      if (this.config.sync.internal) {
        this.syncManager = new InternalSyncManager({
          serverUrl: this.config.sync.internal.serverUrl,
          apiKey: this.config.sync.internal.apiKey,
          batchSize: this.config.sync.internal.batchSize || 10,
          retryAttempts: this.config.sync.internal.retryAttempts || 3,
          retryDelay: this.config.sync.internal.retryDelay || 1000
        })
      }

    } catch (error) {
      throw new Error(`Failed to initialize DataCollect API: ${error}`)
    }
  }

  // Entity operations
  get entities() {
    if (!this.db) {
      throw new Error('Database not initialized')
    }

    const collection = createEntityCollection(this.db)
    const queries = createEntityQueries(() => collection)
    const commands = createEntityCommands(() => collection)

    return {
      // Query operations
      findById: queries.getById,
      findByType: queries.getByType,
      findByStatus: queries.getByStatus,
      search: queries.search,
      getAll: queries.getAll,
      filter: queries.getWithFilter,

      // Command operations
      create: commands.create,
      update: commands.update,
      delete: commands.delete,
      validate: commands.validate,
      clone: commands.clone,
      bulkUpdate: commands.bulkUpdate,

      // Direct collection access
      collection
    }
  }

  // Sync operations
  get sync() {
    if (!this.syncManager) {
      throw new Error('Sync manager not initialized')
    }

    return {
      push: () => this.syncManager!.pushChanges(),
      pull: (since?: Date) => this.syncManager!.pullChanges(since),
      addPendingChange: (change: any) => this.syncManager!.addPendingChange(change),
      getPendingChanges: () => this.syncManager!.getPendingChanges(),
      setOnlineStatus: (isOnline: boolean) => this.syncManager!.setOnlineStatus(isOnline)
    }
  }

  // Authentication
  get auth() {
    return {
      getSession: () => this.sessionManager.getSession(),
      getUser: () => this.sessionManager.getUser(),
      getAccessToken: () => this.sessionManager.getAccessToken(),
      isAuthenticated: () => this.sessionManager.isAuthenticated(),
      setSession: (tokens: any, user: any) => this.sessionManager.setSession(tokens, user),
      clearSession: () => this.sessionManager.clearSession(),
      refreshTokens: () => this.sessionManager.refreshTokens(),
      hasPermission: (permission: string) => this.sessionManager.hasPermission(permission),
      hasRole: (role: string) => this.sessionManager.hasRole(role)
    }
  }

  // State machines
  get machines() {
    return {
      entity: entityMachine,
      sync: syncMachine,
      auth: authMachine,
      form: formMachine,

      // Create interpreters
      createEntityInterpreter: (initialContext?: any) => {
        const machine = entityMachine.withContext(initialContext || entityMachine.context)
        return interpret(machine)
      },

      createSyncInterpreter: (initialContext?: any) => {
        const machine = syncMachine.withContext(initialContext || syncMachine.context)
        return interpret(machine)
      },

      createAuthInterpreter: (initialContext?: any) => {
        const machine = authMachine.withContext(initialContext || authMachine.context)
        return interpret(machine)
      },

      createFormInterpreter: (initialContext?: any) => {
        const machine = formMachine.withContext(initialContext || formMachine.context)
        return interpret(machine)
      }
    }
  }

  // Cleanup
  async destroy(): Promise<void> {
    if (this.db) {
      await this.db.close()
      this.db = null
    }
    this.syncManager = null
  }
}

// Factory function for easier API creation
export const createDataCollectAPI = (config: DataCollectConfig): DataCollectAPI => {
  return new DataCollectAPI(config)
}

// Default export
export default DataCollectAPI