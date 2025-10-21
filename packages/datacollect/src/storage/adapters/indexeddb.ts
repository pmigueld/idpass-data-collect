import type { RxDatabase } from 'rxdb'
import type { Entity } from '../../entities/types'

export interface IndexedDbConfig {
  name: string
  version: number
  collections: {
    entities: {
      schema: any
      options?: any
    }
  }
}

export class IndexedDbStorageAdapter {
  private db: RxDatabase | null = null
  private config: IndexedDbConfig

  constructor(config: IndexedDbConfig) {
    this.config = config
  }

  async initialize(): Promise<void> {
    try {
      const { createRxDatabase } = await import('rxdb')
      const { getRxStorageIndexedDB } = await import('rxdb/plugins/storage-indexeddb')

      this.db = await createRxDatabase({
        name: this.config.name,
        storage: getRxStorageIndexedDB(),
        multiInstance: false,
        eventReduce: true,
        cleanupPolicy: {}
      })

      // Add collections
      await this.db.addCollections({
        entities: {
          schema: this.config.collections.entities.schema,
          ...this.config.collections.entities.options
        }
      })

    } catch (error) {
      throw new Error(`Failed to initialize IndexedDB storage: ${error}`)
    }
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.close()
      this.db = null
    }
  }

  getDatabase(): RxDatabase {
    if (!this.db) {
      throw new Error('Database not initialized. Call initialize() first.')
    }
    return this.db
  }

  // Entity operations
  async getEntity(id: string): Promise<Entity | null> {
    const collection = this.db!.entities
    const doc = await collection.findOne(id).exec()
    return doc?.toJSON() || null
  }

  async getEntities(criteria?: any): Promise<Entity[]> {
    const collection = this.db!.entities
    let query = collection.find()

    if (criteria) {
      Object.entries(criteria).forEach(([key, value]) => {
        query = query.where(key).eq(value)
      })
    }

    const docs = await query.exec()
    return docs.map(doc => doc.toJSON())
  }

  async saveEntity(entity: Entity): Promise<Entity> {
    const collection = this.db!.entities

    try {
      // Try to update existing entity
      const existing = await collection.findOne(entity.id).exec()
      if (existing) {
        await existing.update({
          $set: {
            ...entity,
            updatedAt: new Date().toISOString()
          }
        })
        return existing.toJSON()
      }

      // Create new entity
      await collection.insert({
        ...entity,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })

      return entity
    } catch (error) {
      throw new Error(`Failed to save entity: ${error}`)
    }
  }

  async deleteEntity(id: string): Promise<boolean> {
    const collection = this.db!.entities
    const doc = await collection.findOne(id).exec()

    if (!doc) {
      return false
    }

    await doc.remove()
    return true
  }

  async getEntityCount(): Promise<number> {
    const collection = this.db!.entities
    const docs = await collection.find().exec()
    return docs.length
  }

  async clearAll(): Promise<void> {
    const collection = this.db!.entities
    const docs = await collection.find().exec()

    await Promise.all(docs.map(doc => doc.remove()))
  }

  // Batch operations
  async batchSaveEntities(entities: Entity[]): Promise<Entity[]> {
    const results: Entity[] = []

    for (const entity of entities) {
      try {
        const saved = await this.saveEntity(entity)
        results.push(saved)
      } catch (error) {
        console.error(`Failed to save entity ${entity.id}:`, error)
      }
    }

    return results
  }

  async batchDeleteEntities(ids: string[]): Promise<number> {
    let deletedCount = 0

    for (const id of ids) {
      try {
        const deleted = await this.deleteEntity(id)
        if (deleted) deletedCount++
      } catch (error) {
        console.error(`Failed to delete entity ${id}:`, error)
      }
    }

    return deletedCount
  }

  // Sync-related operations
  async getEntitiesModifiedSince(timestamp: Date): Promise<Entity[]> {
    const collection = this.db!.entities
    const docs = await collection.find()
      .where('updatedAt')
      .gt(timestamp.toISOString())
      .exec()

    return docs.map(doc => doc.toJSON())
  }

  async getEntitiesByStatus(status: Entity['status']): Promise<Entity[]> {
    const collection = this.db!.entities
    const docs = await collection.find()
      .where('status')
      .eq(status)
      .exec()

    return docs.map(doc => doc.toJSON())
  }

  // Subscription for real-time updates
  subscribeToEntities(callback: (entities: Entity[]) => void): () => void {
    const collection = this.db!.entities
    const subscription = collection.find().$.subscribe(docs => {
      callback(docs.map(doc => doc.toJSON()))
    })

    return () => subscription.unsubscribe()
  }

  subscribeToEntity(id: string, callback: (entity: Entity | null) => void): () => void {
    const collection = this.db!.entities
    const subscription = collection.findOne(id).$.subscribe(doc => {
      callback(doc?.toJSON() || null)
    })

    return () => subscription.unsubscribe()
  }
}