<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

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

interface EntityPagination {
  page: number
  limit: number
  total: number
  pages: number
}

const entities = ref<Entity[]>([])
const pagination = ref<EntityPagination>({
  page: 1,
  limit: 50,
  total: 0,
  pages: 0
})

const isLoading = ref(false)
const error = ref<string | null>(null)
const searchTerm = ref('')
const typeFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(50)

const API_URL = import.meta.env.VITE_API_URL

const fetchEntities = async () => {
  if (!authStore.isAuthenticated) return

  isLoading.value = true
  error.value = null

  try {
    const params = new URLSearchParams({
      configId: 'default',
      page: currentPage.value.toString(),
      limit: pageSize.value.toString(),
    })

    if (searchTerm.value) {
      params.append('search', searchTerm.value)
    }

    if (typeFilter.value) {
      params.append('type', typeFilter.value)
    }

    const response = await axios.get(`${API_URL}/api/entities?${params}`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })

    entities.value = response.data.entities || []
    pagination.value = response.data.pagination || {
      page: 1,
      limit: 50,
      total: 0,
      pages: 0
    }
  } catch (err) {
    console.error('Failed to fetch entities:', err)
    error.value = 'Failed to load entities. Please try again.'
  } finally {
    isLoading.value = false
  }
}

const onSearch = () => {
  currentPage.value = 1
  fetchEntities()
}

const onPageChange = (newPage: number) => {
  currentPage.value = newPage
  fetchEntities()
}

const navigateToEntity = (entity: Entity) => {
  router.push(`/entities/${entity.modified.guid}`)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString()
}

const getSyncStatus = (entity: Entity) => {
  if (entity.initial.version !== entity.modified.version) {
    return { text: 'Modified', class: 'bg-warning text-dark' }
  }
  return { text: 'Synced', class: 'bg-success' }
}

onMounted(() => {
  fetchEntities()
})
</script>

<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h1>Entities</h1>
          <button class="btn btn-outline-secondary" @click="fetchEntities" :disabled="isLoading">
            <i class="bi bi-arrow-clockwise me-2"></i>
            Refresh
          </button>
        </div>

        <!-- Filters -->
        <div class="card mb-4">
          <div class="card-body">
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label">Search</label>
                <div class="input-group">
                  <input v-model="searchTerm" type="text" class="form-control" placeholder="Search by name..." @keyup.enter="onSearch">
                  <button class="btn btn-outline-primary" @click="onSearch">
                    <i class="bi bi-search"></i>
                  </button>
                </div>
              </div>
              <div class="col-md-6">
                <label class="form-label">Type</label>
                <select v-model="typeFilter" class="form-select" @change="onSearch">
                  <option value="">All Types</option>
                  <option value="individual">Individual</option>
                  <option value="group">Group</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading/Error States -->
        <div v-if="isLoading" class="text-center py-4">
          <div class="spinner-border text-primary"></div>
          <p class="mt-2">Loading entities...</p>
        </div>

        <div v-else-if="error" class="alert alert-danger">
          <i class="bi bi-exclamation-triangle me-2"></i>
          {{ error }}
        </div>

        <!-- Entities Table -->
        <div v-else-if="entities.length > 0" class="card">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Last Updated</th>
                  <th>Version</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="entity in entities" :key="entity.modified.guid">
                  <td>
                    <strong>{{ entity.modified.name || entity.modified.data?.name || 'Unnamed' }}</strong>
                    <br>
                    <small class="text-muted">{{ entity.modified.guid }}</small>
                  </td>
                  <td>
                    <span class="badge bg-secondary">{{ entity.modified.type }}</span>
                  </td>
                  <td>
                    <span :class="`badge ${getSyncStatus(entity).class}`">
                      {{ getSyncStatus(entity).text }}
                    </span>
                  </td>
                  <td>
                    <small>{{ formatDate(entity.modified.lastUpdated) }}</small>
                  </td>
                  <td>
                    <span class="badge bg-info">{{ entity.modified.version }}</span>
                  </td>
                  <td>
                    <button class="btn btn-sm btn-outline-primary" @click="navigateToEntity(entity)">
                      <i class="bi bi-eye"></i>
                      View
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div v-if="pagination.pages > 1" class="card-footer d-flex justify-content-between align-items-center">
            <div class="text-muted small">
              Showing {{ ((pagination.page - 1) * pagination.limit) + 1 }} to
              {{ Math.min(pagination.page * pagination.limit, pagination.total) }} of
              {{ pagination.total }}
            </div>
            <nav>
              <ul class="pagination pagination-sm mb-0">
                <li class="page-item" :class="{ disabled: pagination.page <= 1 }">
                  <button class="page-link" @click="onPageChange(pagination.page - 1)">Previous</button>
                </li>
                <li v-for="pageNum in Math.min(5, pagination.pages)" :key="pageNum" class="page-item" :class="{ active: pageNum === pagination.page }">
                  <button class="page-link" @click="onPageChange(pageNum)">{{ pageNum }}</button>
                </li>
                <li class="page-item" :class="{ disabled: pagination.page >= pagination.pages }">
                  <button class="page-link" @click="onPageChange(pagination.page + 1)">Next</button>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-5">
          <i class="bi bi-inbox display-1 text-muted"></i>
          <h3 class="mt-3 text-muted">No entities found</h3>
        </div>
      </div>
    </div>
  </div>
</template> 
