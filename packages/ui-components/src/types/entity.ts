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
}

export interface SyncStatus {
  status: 'idle' | 'syncing' | 'success' | 'error' | 'offline'
  lastSyncTime?: Date
  pendingChanges: number
  conflicts: number
}

export interface Conflict {
  id: string
  entityId: string
  entityType: string
  local: Record<string, any>
  remote: Record<string, any>
  timestamp: string | Date
}

export interface AuditEvent {
  id: string
  entityId: string
  type: 'create' | 'update' | 'delete' | 'sync'
  timestamp: string | Date
  user?: string
  description: string
  details?: Record<string, any>
}

export interface FormSubmission {
  id: string
  formId: string
  data: Record<string, any>
  status: 'draft' | 'submitted' | 'synced'
  createdAt: string | Date
  submittedAt?: string | Date
}