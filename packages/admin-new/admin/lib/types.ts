/*
 * Licensed to the Association pour la cooperation numerique (ACN) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The ACN licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

export type UserRole = "admin" | "program_manager" | "data_analyst" | "integration_manager" | "viewer"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  createdAt: Date
  lastLogin: Date
}

export interface FormAppStatus {
  status: "active" | "draft" | "archived"
  lastSyncedAt: Date | null
  syncHealth: "healthy" | "warning" | "error"
}

export interface ProgramVersionEvent {
  id: string
  version: string
  timestamp: Date
  changedBy: string
  changeType: "created" | "updated" | "archived"
  changes: {
    field: string
    oldValue?: any
    newValue?: any
  }[]
  description?: string
}

export interface FormApp {
  id: string
  name: string
  description: string
  version: string
  formsCount: number
  entitiesBackendSynced: number
  entitiesExternalSynced: number
  totalEntities: number
  deploymentUrl: string
  qrCodeData: string
  createdAt: Date
  updatedAt: Date
  createdBy: string
  status: FormAppStatus
  externalIntegration: string | null
  versionHistory?: ProgramVersionEvent[]
}

export interface SyncMetrics {
  pendingSync: number
  failedSync: number
  lastSyncDuration: number
  avgSyncDuration: number
}

export type EventType =
  | "entity_created"
  | "entity_updated"
  | "entity_deleted"
  | "sync_started"
  | "sync_completed"
  | "sync_failed"
  | "conflict_detected"
  | "conflict_resolved"
  | "external_sync_started"
  | "external_sync_completed"
  | "external_sync_failed"

export interface ConflictDetail {
  id: string
  entityId: string
  formAppId: string
  formAppName: string
  formName: string
  detectedAt: Date
  resolvedAt: Date | null
  status: "pending" | "resolved" | "failed"
  conflictType: "concurrent_update" | "network_partition" | "version_mismatch"
  localVersion: number
  remoteVersion: number
  conflictingFields: {
    field: string
    localValue: any
    remoteValue: any
    resolvedValue?: any
  }[]
  resolutionStrategy?: "manual" | "auto" | "latest_wins" | "merge"
  resolvedBy?: string
}

export interface Event {
  id: string
  entityId: string
  type: EventType
  timestamp: Date
  userId: string
  userName: string
  deviceId: string
  data: Record<string, any>
  metadata: {
    version: number
    previousVersion?: number
    conflictResolution?: "manual" | "auto" | "latest_wins"
    syncDuration?: number
    errorMessage?: string
    causationId?: string // ID of the event that caused this event
    correlationId?: string // ID to group related events
    streamPosition?: number // Position in the event stream
  }
}

export interface Entity {
  id: string
  formAppId: string
  formId: string
  formName: string
  createdAt: Date
  updatedAt: Date
  version: number
  status: "pending" | "synced" | "conflict" | "failed"
  backendSynced: boolean
  externalSynced: boolean
  lastSyncedAt: Date | null
  conflictCount: number
  eventCount: number
  data: Record<string, any>
}

export interface FormDefinition {
  id: string
  name: string
  version: string
  fields: number
  entityCount: number
}

export interface EntityForm {
  id: string
  name: string
  description: string
  formSchema: Record<string, any> // Form.io schema
  version: string
  entityCount: number
}

export interface InternalAuthenticationConfig {
  type: "none" | "basic" | "keycloak" | "auth0"
  config?: {
    username?: string
    password?: string
    keycloakUrl?: string
    keycloakRealm?: string
    auth0Domain?: string
    auth0ClientId?: string
  }
}

export interface ExternalAuthenticationConfig {
  type: "none" | "basic" | "keycloak" | "auth0"
  config?: {
    username?: string
    password?: string
    keycloakUrl?: string
    keycloakRealm?: string
    auth0Domain?: string
    auth0ClientId?: string
  }
}

export interface IntegrationConfig {
  type: "openfn" | "openspp" | "generic_mock" | null
  authentication?: ExternalAuthenticationConfig
  webhookUrl?: string
  apiKey?: string
}

export interface FieldMapping {
  id: string
  formFieldId: string
  formFieldName: string
  externalFieldName: string
}

export interface CollectionProgramDraft {
  basicInfo: {
    name: string
    description: string
    version: string
    integrationService: "openfn" | "openspp" | "generic_mock" | null
    internalAuthType: "none" | "basic" | "keycloak" | "auth0"
  }
  entityForms: EntityForm[]
  fieldMappings: FieldMapping[]
  internalAuth: InternalAuthenticationConfig
  externalAuth: ExternalAuthenticationConfig
  integrationConfig?: Record<string, any>
}
