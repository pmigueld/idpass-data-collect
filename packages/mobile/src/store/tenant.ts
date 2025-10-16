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

import { useDatabase } from '@/database'
import { defineStore } from 'pinia'
import { TenantAppData } from '@/schemas/tenantApp.schema'
import { ref } from 'vue'

export const useTenantStore = defineStore('tenant', () => {
  const database = useDatabase()
  const tenant = ref<TenantAppData | null>(null)
  const tenantApps = ref<TenantAppData[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const getTenant = async (appId: string) => {
    const foundDocuments = await database.tenantapps
      .find({
        selector: { id: appId }
      })
      .exec()
    tenant.value = foundDocuments[0]
    return foundDocuments[0]
  }

  const loadTenantApps = async () => {
    try {
      loading.value = true
      error.value = null

      const documents = await database.tenantapps.find().exec()
      tenantApps.value = documents.map(doc => doc.toJSON())
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load tenant apps'
      console.error('Error loading tenant apps:', err)
    } finally {
      loading.value = false
    }
  }

  const getTenantAppsByType = (type?: string) => {
    if (!type) return tenantApps.value
    return tenantApps.value.filter(app =>
      app.entityForms?.some(form =>
        form.name?.toLowerCase().includes(type.toLowerCase())
      )
    )
  }

  const getAvailableVersions = () => {
    // This would typically come from the server or be calculated based on available versions
    // For now, return empty array
    return []
  }

  const getVersionHistory = () => {
    // This would typically be stored separately or fetched from server
    // For now, return empty array
    return []
  }

  const getEntityCount = async (appId: string) => {
    try {
      // This would need to be implemented based on actual entity counting logic
      // For now, return 0 as placeholder
      return 0
    } catch (err) {
      console.error('Error getting entity count:', err)
      return 0
    }
  }

  const getSyncStatus = (appId: string) => {
    // This would need to be implemented based on actual sync status logic
    return 'unknown'
  }

  return {
    // State
    tenant,
    tenantApps,
    loading,
    error,

    // Actions
    getTenant,
    loadTenantApps,
    getTenantAppsByType,
    getAvailableVersions,
    getVersionHistory,
    getEntityCount,
    getSyncStatus
  }
})
