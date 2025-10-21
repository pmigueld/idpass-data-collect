import type { Entity } from '../entities/types'

export interface InternalSyncConfig {
  serverUrl: string
  apiKey?: string
  batchSize: number
  retryAttempts: number
  retryDelay: number
}

export interface SyncResult {
  success: boolean
  syncedCount: number
  failedCount: number
  errors: string[]
  lastSyncTime: Date
}

export interface PendingChange {
  id: string
  entityId: string
  operation: 'create' | 'update' | 'delete'
  data: any
  timestamp: Date
}

export class InternalSyncManager {
  private config: InternalSyncConfig
  private pendingChanges: PendingChange[] = []
  private isOnline: boolean = navigator?.onLine ?? true

  constructor(config: InternalSyncConfig) {
    this.config = config
    this.setupNetworkListeners()
  }

  async pushChanges(): Promise<SyncResult> {
    if (!this.isOnline) {
      throw new Error('Cannot sync while offline')
    }

    if (this.pendingChanges.length === 0) {
      return {
        success: true,
        syncedCount: 0,
        failedCount: 0,
        errors: [],
        lastSyncTime: new Date()
      }
    }

    const result: SyncResult = {
      success: false,
      syncedCount: 0,
      failedCount: 0,
      errors: [],
      lastSyncTime: new Date()
    }

    try {
      // Group changes by entity for batch processing
      const batches = this.batchChanges(this.pendingChanges)

      for (const batch of batches) {
        try {
          await this.syncBatch(batch)
          result.syncedCount += batch.length
        } catch (error) {
          result.failedCount += batch.length
          result.errors.push(`Batch sync failed: ${error}`)
        }
      }

      result.success = result.failedCount === 0
      this.pendingChanges = []

    } catch (error) {
      result.errors.push(`Sync failed: ${error}`)
    }

    return result
  }

  async pullChanges(since?: Date): Promise<SyncResult> {
    if (!this.isOnline) {
      throw new Error('Cannot pull while offline')
    }

    const result: SyncResult = {
      success: false,
      syncedCount: 0,
      failedCount: 0,
      errors: [],
      lastSyncTime: new Date()
    }

    try {
      const response = await fetch(`${this.config.serverUrl}/api/sync/pull`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        },
        body: JSON.stringify({
          since: since?.toISOString(),
          batchSize: this.config.batchSize
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      // Process pulled entities
      for (const entityData of data.entities || []) {
        try {
          await this.applyEntityChange(entityData)
          result.syncedCount++
        } catch (error) {
          result.failedCount++
          result.errors.push(`Failed to apply entity ${entityData.id}: ${error}`)
        }
      }

      result.success = result.failedCount === 0

    } catch (error) {
      result.errors.push(`Pull failed: ${error}`)
    }

    return result
  }

  addPendingChange(change: Omit<PendingChange, 'id' | 'timestamp'>): void {
    const pendingChange: PendingChange = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      ...change
    }

    this.pendingChanges.push(pendingChange)
  }

  getPendingChanges(): PendingChange[] {
    return [...this.pendingChanges]
  }

  clearPendingChanges(): void {
    this.pendingChanges = []
  }

  setOnlineStatus(isOnline: boolean): void {
    this.isOnline = isOnline
  }

  private batchChanges(changes: PendingChange[]): PendingChange[][] {
    const batches: PendingChange[][] = []
    for (let i = 0; i < changes.length; i += this.config.batchSize) {
      batches.push(changes.slice(i, i + this.config.batchSize))
    }
    return batches
  }

  private async syncBatch(batch: PendingChange[]): Promise<void> {
    const response = await fetch(`${this.config.serverUrl}/api/sync/push`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
      },
      body: JSON.stringify({ changes: batch })
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const result = await response.json()
    if (!result.success) {
      throw new Error(result.message || 'Batch sync failed')
    }
  }

  private async applyEntityChange(entityData: any): Promise<void> {
    // This would apply the entity change to local storage
    // Implementation depends on your storage layer
    console.log('Applying entity change:', entityData)
  }

  private setupNetworkListeners(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.setOnlineStatus(true))
      window.addEventListener('offline', () => this.setOnlineStatus(false))
    }
  }
}