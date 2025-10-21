import type { RxDatabase } from 'rxdb'
import type { Entity } from '../entities/types'

export interface EntityCollection {
  findById(id: string): Promise<Entity | null>
  findMany(criteria?: any): Promise<Entity[]>
  insert(entity: Omit<Entity, 'id' | 'createdAt' | 'updatedAt'>): Promise<Entity>
  update(id: string, data: Partial<Entity>): Promise<Entity>
  delete(id: string): Promise<boolean>
  subscribe(callback: (entities: Entity[]) => void): () => void
}

export const createEntityCollection = async (db: RxDatabase): Promise<EntityCollection> => {
  const collection = db.entities

  return {
    async findById(id: string): Promise<Entity | null> {
      try {
        const doc = await collection.findOne(id).exec()
        return doc?.toJSON() || null
      } catch (error) {
        throw new Error(`Failed to find entity: ${error}`)
      }
    },

    async findMany(criteria?: any): Promise<Entity[]> {
      try {
        let query = collection.find()

        if (criteria) {
          // Apply criteria filters
          Object.entries(criteria).forEach(([key, value]) => {
            query = query.where(key).eq(value)
          })
        }

        const docs = await query.exec()
        return docs.map(doc => doc.toJSON())
      } catch (error) {
        throw new Error(`Failed to find entities: ${error}`)
      }
    },

    async insert(entity: Omit<Entity, 'id' | 'createdAt' | 'updatedAt'>): Promise<Entity> {
      try {
        const now = new Date().toISOString()
        const newEntity = {
          ...entity,
          id: crypto.randomUUID(),
          createdAt: now,
          updatedAt: now,
          version: 1
        }

        await collection.insert(newEntity)
        return newEntity
      } catch (error) {
        throw new Error(`Failed to insert entity: ${error}`)
      }
    },

    async update(id: string, data: Partial<Entity>): Promise<Entity> {
      try {
        const doc = await collection.findOne(id).exec()
        if (!doc) {
          throw new Error(`Entity with id ${id} not found`)
        }

        const updatedData = {
          ...data,
          updatedAt: new Date().toISOString(),
          version: (doc.version || 1) + 1
        }

        await doc.update(updatedData)
        return doc.toJSON()
      } catch (error) {
        throw new Error(`Failed to update entity: ${error}`)
      }
    },

    async delete(id: string): Promise<boolean> {
      try {
        const doc = await collection.findOne(id).exec()
        if (!doc) {
          return false
        }

        await doc.remove()
        return true
      } catch (error) {
        throw new Error(`Failed to delete entity: ${error}`)
      }
    },

    subscribe(callback: (entities: Entity[]) => void): () => void {
      const subscription = collection.find().$.subscribe(docs => {
        callback(docs.map(doc => doc.toJSON()))
      })

      return () => subscription.unsubscribe()
    }
  }
}