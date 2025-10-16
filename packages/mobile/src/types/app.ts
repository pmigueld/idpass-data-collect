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

export interface AppMetadata {
  totalEntities: number
  syncStatus: 'synced' | 'syncing' | 'offline' | 'error'
  lastSync?: string
  version: string
  isLatestVersion: boolean
}

export interface VersionInfo {
  version: string
  releaseDate: string
  changes: string[]
  isCurrent: boolean
  isDeprecated?: boolean
}

export interface EntityFilter {
  search?: string
  status?: string
  type?: string
  dateRange?: {
    start: string
    end: string
  }
}

export interface EntitySort {
  field: string
  direction: 'asc' | 'desc'
}

export interface PaginationOptions {
  page: number
  limit: number
}

export interface EntityListOptions {
  filter?: EntityFilter
  sort?: EntitySort
  pagination?: PaginationOptions
}

export interface EntityFormData {
  [key: string]: any
}

export interface EventData {
  id: string
  type: string
  timestamp: string
  user: string
  entityId: string
  entityType: string
  data?: any
  metadata?: {
    version: string
    tenantAppVersion: string
    source: string
  }
}

export interface AuthState {
  isAuthenticated: boolean
  user?: {
    id: string
    username: string
    roles: string[]
  }
  token?: string
  expiresAt?: string
}

export interface NavigationItem {
  title: string
  icon: string
  to: string
  badge?: string | number
  disabled?: boolean
}