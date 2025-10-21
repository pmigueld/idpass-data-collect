import type { Entity, EntityForm, EntityValidationRule } from './types'
import { validateEntity } from './validation'

export interface EntityCommands {
  create(form: EntityForm): Promise<Entity>
  update(id: string, data: Partial<Entity>): Promise<Entity>
  delete(id: string): Promise<boolean>
  validate(entity: Entity): Promise<Entity>
  clone(id: string, modifications?: Partial<Entity>): Promise<Entity>
  bulkUpdate(updates: Array<{ id: string; data: Partial<Entity> }>): Promise<Entity[]>
}

export const createEntityCommands = (
  getCollection: () => any,
  validationRules?: EntityValidationRule[]
): EntityCommands => {
  return {
    async create(form: EntityForm): Promise<Entity> {
      const collection = getCollection()

      // Create entity with generated ID and timestamps
      const entity: Entity = {
        id: crypto.randomUUID(),
        name: form.name,
        type: form.type,
        description: form.description,
        data: form.data || {},
        status: 'pending',
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // Validate before saving
      if (validationRules) {
        const validationResult = validateEntity(entity, validationRules)
        if (!validationResult.isValid) {
          throw new Error(`Validation failed: ${JSON.stringify(validationResult.errors)}`)
        }
      }

      return await collection.insert(entity)
    },

    async update(id: string, data: Partial<Entity>): Promise<Entity> {
      const collection = getCollection()

      // Validate data before updating
      if (validationRules && Object.keys(data).length > 0) {
        const existing = await collection.findById(id)
        if (!existing) {
          throw new Error(`Entity with id ${id} not found`)
        }

        const updated = { ...existing, ...data, updatedAt: new Date().toISOString() }
        const validationResult = validateEntity(updated, validationRules)
        if (!validationResult.isValid) {
          throw new Error(`Validation failed: ${JSON.stringify(validationResult.errors)}`)
        }
      }

      return await collection.update(id, data)
    },

    async delete(id: string): Promise<boolean> {
      const collection = getCollection()
      return await collection.delete(id)
    },

    async validate(entity: Entity): Promise<Entity> {
      if (!validationRules) {
        return entity
      }

      const validationResult = validateEntity(entity, validationRules)
      if (!validationResult.isValid) {
        throw new Error(`Validation failed: ${JSON.stringify(validationResult.errors)}`)
      }

      return entity
    },

    async clone(id: string, modifications?: Partial<Entity>): Promise<Entity> {
      const collection = getCollection()
      const original = await collection.findById(id)

      if (!original) {
        throw new Error(`Entity with id ${id} not found`)
      }

      const cloned = {
        ...original,
        ...modifications,
        id: crypto.randomUUID(),
        name: modifications?.name || `${original.name} (Copy)`,
        status: 'pending' as const,
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      delete (cloned as any).id // Remove the old id

      return await collection.insert(cloned)
    },

    async bulkUpdate(updates: Array<{ id: string; data: Partial<Entity> }>): Promise<Entity[]> {
      const collection = getCollection()
      const results: Entity[] = []

      for (const update of updates) {
        try {
          const updated = await collection.update(update.id, update.data)
          results.push(updated)
        } catch (error) {
          console.error(`Failed to update entity ${update.id}:`, error)
          // Continue with other updates
        }
      }

      return results
    }
  }
}