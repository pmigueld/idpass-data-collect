import type { Entity, EntityFilter } from './types'

export interface EntityQueries {
  getById(id: string): Promise<Entity | null>
  getByType(type: string): Promise<Entity[]>
  getByStatus(status: Entity['status']): Promise<Entity[]>
  search(query: string): Promise<Entity[]>
  getAll(): Promise<Entity[]>
  getWithFilter(filter: EntityFilter): Promise<Entity[]>
}

export const createEntityQueries = (getCollection: () => any): EntityQueries => {
  return {
    async getById(id: string): Promise<Entity | null> {
      const collection = getCollection()
      return await collection.findById(id)
    },

    async getByType(type: string): Promise<Entity[]> {
      const collection = getCollection()
      return await collection.findMany({ type })
    },

    async getByStatus(status: Entity['status']): Promise<Entity[]> {
      const collection = getCollection()
      return await collection.findMany({ status })
    },

    async search(query: string): Promise<Entity[]> {
      const collection = getCollection()
      // Simple search implementation - could be enhanced with full-text search
      const allEntities = await collection.findMany()
      const lowerQuery = query.toLowerCase()

      return allEntities.filter((entity: Entity) =>
        entity.name?.toLowerCase().includes(lowerQuery) ||
        entity.description?.toLowerCase().includes(lowerQuery) ||
        entity.id.toLowerCase().includes(lowerQuery)
      )
    },

    async getAll(): Promise<Entity[]> {
      const collection = getCollection()
      return await collection.findMany()
    },

    async getWithFilter(filter: EntityFilter): Promise<Entity[]> {
      const collection = getCollection()
      return await collection.findMany(filter)
    }
  }
}