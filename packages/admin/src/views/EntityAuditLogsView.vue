<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

interface AuditLogEntry {
  guid: string
  timestamp: string
  userId: string
  action: string
  eventGuid: string
  entityGuid: string
  changes: Record<string, any>
  signature: string
}

const auditLogs = ref<AuditLogEntry[]>([])
const entity = ref<any>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)
const selectedLog = ref<AuditLogEntry | null>(null)
const showExportModal = ref(false)

const API_URL = import.meta.env.VITE_API_URL

const fetchAuditLogs = async () => {
  if (!authStore.isAuthenticated || !authStore.isAdmin) return

  isLoading.value = true
  error.value = null

  try {
    // First get entity details
    const entityResponse = await axios.get(`${API_URL}/api/entities/${route.params.guid}?configId=default`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })
    entity.value = entityResponse.data

    // Then get audit logs for this entity
    const auditResponse = await axios.get(`${API_URL}/api/entities/${route.params.guid}/audit-logs?configId=default`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })

    auditLogs.value = auditResponse.data || []
  } catch (err) {
    console.error('Failed to fetch audit logs:', err)
    error.value = 'Failed to load audit logs. Please try again.'
  } finally {
    isLoading.value = false
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString()
}

const exportAsJSON = () => {
  const dataStr = JSON.stringify(auditLogs.value, null, 2)
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
  const exportFileDefaultName = `audit-logs-${entity.value?.modified.guid}-${new Date().toISOString().split('T')[0]}.json`
  const linkElement = document.createElement('a')
  linkElement.setAttribute('href', dataUri)
  linkElement.setAttribute('download', exportFileDefaultName)
  linkElement.click()
  showExportModal.value = false
}

const exportAsCSV = () => {
  const headers = ['Timestamp', 'User', 'Action', 'Event GUID', 'Changes']
  const csvContent = [
    headers.join(','),
    ...auditLogs.value.map(log => [
      log.timestamp,
      log.userId,
      log.action,
      log.eventGuid.substring(0, 8) + '...',
      JSON.stringify(log.changes).replace(/,/g, ';')
    ].join(','))
  ].join('\n')

  const dataUri = 'data:text/csv;charset=utf-8,'+ encodeURIComponent(csvContent)
  const exportFileDefaultName = `audit-logs-${entity.value?.modified.guid}-${new Date().toISOString().split('T')[0]}.csv`
  const linkElement = document.createElement('a')
  linkElement.setAttribute('href', dataUri)
  linkElement.setAttribute('download', exportFileDefaultName)
  linkElement.click()
  showExportModal.value = false
}

const navigateBack = () => {
  router.push(`/entities/${route.params.guid}`)
}

const sortedAuditLogs = computed(() => {
  return [...auditLogs.value].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
})

onMounted(() => {
  fetchAuditLogs()
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
              Back to Entity
            </button>
            <h1>
              Audit Logs
              <small class="text-muted ms-2">{{ entity?.modified.guid }}</small>
            </h1>
          </div>
          <div class="d-flex gap-2">
            <button class="btn btn-outline-primary" @click="showExportModal = true">
              <i class="bi bi-download me-2"></i>
              Export
            </button>
            <button class="btn btn-outline-secondary" @click="fetchAuditLogs" :disabled="isLoading">
              <i class="bi bi-arrow-clockwise me-2"></i>
              Refresh
            </button>
          </div>
        </div>

        <!-- Loading/Error States -->
        <div v-if="isLoading" class="text-center py-4">
          <div class="spinner-border text-primary"></div>
          <p class="mt-2">Loading audit logs...</p>
        </div>

        <div v-else-if="error" class="alert alert-danger">
          <i class="bi bi-exclamation-triangle me-2"></i>
          {{ error }}
        </div>

        <!-- Audit Logs Table -->
        <div v-else-if="auditLogs.length > 0">
          <div class="card mb-4">
            <div class="card-header">
              <h5 class="card-title mb-0">Audit Trail ({{ auditLogs.length }} entries)</h5>
            </div>
            <div class="table-responsive">
              <table class="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>User</th>
                    <th>Action</th>
                    <th>Changes</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="log in sortedAuditLogs" :key="log.guid">
                    <td>
                      <small>{{ formatDate(log.timestamp) }}</small>
                    </td>
                    <td>
                      <code class="small">{{ log.userId }}</code>
                    </td>
                    <td>
                      <span class="badge bg-primary">{{ log.action.replace(/-/g, ' ') }}</span>
                    </td>
                    <td>
                      <small v-if="Object.keys(log.changes).length > 0">
                        {{ Object.keys(log.changes).length }} fields
                      </small>
                      <span v-else class="text-muted">No changes</span>
                    </td>
                    <td>
                      <button class="btn btn-sm btn-outline-primary" @click="selectedLog = log">
                        <i class="bi bi-eye"></i>
                        View
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Log Details -->
          <div v-if="selectedLog" class="card">
            <div class="card-header">
              <h5 class="card-title mb-0">Log Details</h5>
            </div>
            <div class="card-body">
              <dl class="row mb-3">
                <dt class="col-sm-2">Log ID</dt>
                <dd class="col-sm-10">
                  <code class="small">{{ selectedLog.guid }}</code>
                </dd>

                <dt class="col-sm-2">Timestamp</dt>
                <dd class="col-sm-10">{{ formatDate(selectedLog.timestamp) }}</dd>

                <dt class="col-sm-2">User</dt>
                <dd class="col-sm-10">{{ selectedLog.userId }}</dd>

                <dt class="col-sm-2">Action</dt>
                <dd class="col-sm-10">
                  <span class="badge bg-primary">{{ selectedLog.action.replace(/-/g, ' ') }}</span>
                </dd>

                <dt class="col-sm-2">Event GUID</dt>
                <dd class="col-sm-10">
                  <code class="small">{{ selectedLog.eventGuid }}</code>
                </dd>
              </dl>

              <h6>Changes</h6>
              <pre class="bg-light p-3 rounded small" style="max-height: 300px; overflow-y: auto;">{{ JSON.stringify(selectedLog.changes, null, 2) }}</pre>

              <h6 class="mt-3">Signature</h6>
              <div class="bg-light p-2 rounded text-break">
                <code class="small">{{ selectedLog.signature }}</code>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-5">
          <i class="bi bi-shield display-1 text-muted"></i>
          <h3 class="mt-3 text-muted">No audit logs found</h3>
        </div>
      </div>
    </div>

    <!-- Export Modal -->
    <div v-if="showExportModal" class="modal d-block" style="background-color: rgba(0,0,0,0.5);">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Export Audit Logs</h5>
            <button type="button" class="btn-close" @click="showExportModal = false"></button>
          </div>
          <div class="modal-body">
            <p>Choose format:</p>
            <div class="d-grid gap-2">
              <button class="btn btn-outline-primary" @click="exportAsJSON">
                <i class="bi bi-file-earmark-code me-2"></i>
                Export as JSON
              </button>
              <button class="btn btn-outline-success" @click="exportAsCSV">
                <i class="bi bi-file-earmark-spreadsheet me-2"></i>
                Export as CSV
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 