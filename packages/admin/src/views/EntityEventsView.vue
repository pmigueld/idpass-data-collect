<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

interface FormSubmission {
  guid: string
  entityGuid: string
  type: string
  data: Record<string, any>
  timestamp: string
  userId: string
  syncLevel: number
}

const events = ref<FormSubmission[]>([])
const entity = ref<any>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)
const selectedEvent = ref<FormSubmission | null>(null)

const API_URL = import.meta.env.VITE_API_URL

const fetchEvents = async () => {
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

    // Then get events for this entity
    const eventsResponse = await axios.get(`${API_URL}/api/entities/${route.params.guid}/events?configId=default`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })

    events.value = eventsResponse.data || []
  } catch (err) {
    console.error('Failed to fetch events:', err)
    error.value = 'Failed to load events. Please try again.'
  } finally {
    isLoading.value = false
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString()
}

const getSyncLevelBadge = (syncLevel: number) => {
  switch (syncLevel) {
    case 0: return { text: 'Local', class: 'bg-secondary' }
    case 1: return { text: 'Synced', class: 'bg-success' }
    case 2: return { text: 'Remote', class: 'bg-primary' }
    default: return { text: 'Unknown', class: 'bg-dark' }
  }
}

const navigateBack = () => {
  router.push(`/entities/${route.params.guid}`)
}

const sortedEvents = computed(() => {
  return [...events.value].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
})

onMounted(() => {
  fetchEvents()
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
              Event History
              <small class="text-muted ms-2">{{ entity?.modified.guid }}</small>
            </h1>
          </div>
          <button class="btn btn-outline-secondary" @click="fetchEvents" :disabled="isLoading">
            <i class="bi bi-arrow-clockwise me-2"></i>
            Refresh
          </button>
        </div>

        <!-- Loading/Error States -->
        <div v-if="isLoading" class="text-center py-4">
          <div class="spinner-border text-primary"></div>
          <p class="mt-2">Loading event history...</p>
        </div>

        <div v-else-if="error" class="alert alert-danger">
          <i class="bi bi-exclamation-triangle me-2"></i>
          {{ error }}
        </div>

        <!-- Events List -->
        <div v-else-if="events.length > 0" class="row">
          <div class="col-md-7">
            <div class="card">
              <div class="card-header">
                <h5 class="card-title mb-0">Event Timeline ({{ events.length }})</h5>
              </div>
              <div class="list-group list-group-flush">
                <button v-for="event in sortedEvents" :key="event.guid" class="list-group-item list-group-item-action text-start" @click="selectedEvent = event">
                  <div class="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 class="mb-1">{{ event.type.replace(/-/g, ' ').toUpperCase() }}</h6>
                      <small class="text-muted">{{ formatDate(event.timestamp) }} by {{ event.userId }}</small>
                    </div>
                    <span :class="`badge ${getSyncLevelBadge(event.syncLevel).class}`">
                      {{ getSyncLevelBadge(event.syncLevel).text }}
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <!-- Event Details -->
          <div class="col-md-5">
            <div class="card">
              <div class="card-header">
                <h5 class="card-title mb-0">Details</h5>
              </div>
              <div class="card-body">
                <div v-if="selectedEvent">
                  <h6>{{ selectedEvent.type.replace(/-/g, ' ').toUpperCase() }}</h6>
                  <dl class="row mb-3">
                    <dt class="col-sm-4">Timestamp</dt>
                    <dd class="col-sm-8">{{ formatDate(selectedEvent.timestamp) }}</dd>

                    <dt class="col-sm-4">User</dt>
                    <dd class="col-sm-8">{{ selectedEvent.userId }}</dd>

                    <dt class="col-sm-4">Sync Level</dt>
                    <dd class="col-sm-8">
                      <span :class="`badge ${getSyncLevelBadge(selectedEvent.syncLevel).class}`">
                        {{ getSyncLevelBadge(selectedEvent.syncLevel).text }}
                      </span>
                    </dd>
                  </dl>

                  <h6>Data</h6>
                  <pre class="small bg-light p-2 rounded" style="max-height: 300px; overflow-y: auto;">{{ JSON.stringify(selectedEvent.data, null, 2) }}</pre>
                </div>
                <div v-else class="text-center text-muted py-4">
                  <i class="bi bi-arrow-left-circle display-4"></i>
                  <p class="mt-2">Select an event to view details</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-5">
          <i class="bi bi-clock display-1 text-muted"></i>
          <h3 class="mt-3 text-muted">No events found</h3>
        </div>
      </div>
    </div>
  </div>
</template> 
