<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

interface Entity {
  initial: {
    guid: string
    type: string
    name?: string
    lastUpdated: string
    version: number
  }
  modified: {
    guid: string
    type: string
    name?: string
    lastUpdated: string
    version: number
    data: Record<string, any>
  }
}

const entity = ref<Entity | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)
const activeTab = ref('overview')

const API_URL = import.meta.env.VITE_API_URL

const fetchEntity = async () => {
  if (!authStore.isAuthenticated) return

  isLoading.value = true
  error.value = null

  try {
    const response = await axios.get(`${API_URL}/api/entities/${route.params.guid}?configId=default`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })

    entity.value = response.data
  } catch (err) {
    console.error('Failed to fetch entity:', err)
    error.value = 'Failed to load entity. Please try again.'
  } finally {
    isLoading.value = false
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString()
}

const getSyncStatus = computed(() => {
  if (!entity.value) return { text: 'Unknown', class: 'bg-secondary' }
  if (entity.value.initial.version !== entity.value.modified.version) {
    return { text: 'Modified', class: 'bg-warning text-dark' }
  }
  return { text: 'Synced', class: 'bg-success' }
})

const navigateToEvents = () => {
  router.push(`/entities/${route.params.guid}/events`)
}

const navigateToAuditLogs = () => {
  router.push(`/entities/${route.params.guid}/audit-logs`)
}

const navigateBack = () => {
  router.push('/entities')
}

onMounted(() => {
  fetchEntity()
})
</script>

<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-12">
        <!-- Header -->
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <button class="btn btn-link p-0 me-3" @click="navigateBack">
              <i class="bi bi-arrow-left me-2"></i>
              Back to Entities
            </button>
            <h1>
              {{ entity?.modified.name || entity?.modified.data?.name || 'Unnamed Entity' }}
              <small class="text-muted ms-2">{{ entity?.modified.guid }}</small>
            </h1>
          </div>
          <div>
            <span :class="`badge ${getSyncStatus.class} fs-6`">
              {{ getSyncStatus.text }}
            </span>
          </div>
        </div>

        <!-- Loading/Error States -->
        <div v-if="isLoading" class="text-center py-4">
          <div class="spinner-border text-primary"></div>
          <p class="mt-2">Loading entity details...</p>
        </div>

        <div v-else-if="error" class="alert alert-danger">
          <i class="bi bi-exclamation-triangle me-2"></i>
          {{ error }}
        </div>

        <!-- Entity Details -->
        <div v-else-if="entity" class="row">
          <!-- Metadata Card -->
          <div class="col-md-4">
            <div class="card mb-4">
              <div class="card-header">
                <h5 class="card-title mb-0">Entity Information</h5>
              </div>
              <div class="card-body">
                <dl class="row">
                  <dt class="col-sm-4">GUID</dt>
                  <dd class="col-sm-8">
                    <code class="small">{{ entity.modified.guid }}</code>
                  </dd>

                  <dt class="col-sm-4">Type</dt>
                  <dd class="col-sm-8">
                    <span class="badge bg-secondary">{{ entity.modified.type }}</span>
                  </dd>

                  <dt class="col-sm-4">Version</dt>
                  <dd class="col-sm-8">
                    <span class="badge bg-info">{{ entity.modified.version }}</span>
                  </dd>

                  <dt class="col-sm-4">Last Updated</dt>
                  <dd class="col-sm-8">
                    <small>{{ formatDate(entity.modified.lastUpdated) }}</small>
                  </dd>
                </dl>

                <!-- Action Buttons -->
                <div class="d-grid gap-2 mt-4">
                  <button v-if="authStore.isAdmin" class="btn btn-outline-primary" @click="navigateToEvents">
                    <i class="bi bi-clock-history me-2"></i>
                    View Event History
                  </button>

                  <button v-if="authStore.isAdmin" class="btn btn-outline-secondary" @click="navigateToAuditLogs">
                    <i class="bi bi-shield-check me-2"></i>
                    View Audit Logs
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Entity Data -->
          <div class="col-md-8">
            <div class="card">
              <div class="card-header">
                <h5 class="card-title mb-0">Entity Data</h5>
              </div>

              <div class="card-body">
                <div v-if="activeTab === 'overview'" class="row">
                  <div v-for="(value, key) in entity.modified.data" :key="key" class="col-md-6 mb-3">
                    <div class="card h-100">
                      <div class="card-body">
                        <h6 class="card-title text-capitalize">{{ key.replace(/([A-Z])/g, ' $1').trim() }}</h6>
                        <pre class="small mb-0" style="max-height: 150px; overflow-y: auto;">{{
                          typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)
                        }}</pre>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-else-if="activeTab === 'raw'">
                  <pre style="max-height: 600px; overflow-y: auto;">{{ JSON.stringify(entity.modified.data, null, 2) }}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 
