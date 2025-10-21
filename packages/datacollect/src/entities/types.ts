export interface Entity {
  id: string
  name?: string
  type: string
  status: 'synced' | 'pending' | 'conflict' | 'deleted'
  version: number
  createdAt: string | Date
  updatedAt: string | Date
  description?: string
  data?: Record<string, any>
  metadata?: Record<string, any>
}

export interface EntityFilter {
  type?: string
  status?: Entity['status']
  createdAfter?: string | Date
  updatedAfter?: string | Date
  [key: string]: any
}

export interface EntityValidationRule {
  field: string
  required?: boolean
  type?: 'string' | 'number' | 'boolean' | 'object' | 'array'
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: any, entity: Entity) => boolean | string
}

export interface EntityForm {
  name?: string
  type: string
  description?: string
  data?: Record<string, any>
}

export interface EntityConflict {
  id: string
  entityId: string
  localVersion: Entity
  remoteVersion: Entity
  conflictFields: string[]
  resolved?: boolean
  resolution?: 'local' | 'remote' | 'merge'
  resolvedData?: Partial<Entity>
}