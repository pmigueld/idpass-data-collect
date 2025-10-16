<template>
  <AppLayout
    :title="entity?.name || 'Entity Details'"
    :sync-status="syncStatus"
    :navigation-items="navigationItems"
    @logout="handleLogout"
    @sync="handleSync"
  >
    <div class="entity-detail-view">
      <!-- Loading State -->
      <LoadingState v-if="loading" message="Loading entity details..." />

      <!-- Error State -->
      <ErrorState
        v-else-if="error"
        :message="error"
        show-back
        @back="goBack"
        @retry="loadEntity"
      />

      <!-- Entity Not Found -->
      <ErrorState
        v-else-if="!entity"
        title="Entity Not Found"
        message="The requested entity could not be found."
        show-back
        @back="goBack"
      />

      <!-- Entity Details -->
      <div v-else class="entity-content">
        <!-- Entity Header Card -->
        <v-card class="mb-6" elevation="2">
          <v-card-text class="pa-6">
            <div class="d-flex align-center mb-4">
              <v-avatar size="56" :color="entityColor" class="mr-4">
                <v-icon size="28" color="white">{{ entityIcon }}</v-icon>
              </v-avatar>

              <div class="flex-grow-1">
                <h1 class="text-h4 mb-1">{{ entity.name }}</h1>
                <p class="text-body-1 text-medium-emphasis mb-2">
                  {{ entity.description }}
                </p>
                <div class="d-flex align-center gap-2">
                  <v-chip
                    :color="getStatusColor(entity.status)"
                    size="small"
                  >
                    {{ entity.status }}
                  </v-chip>
                  <v-chip size="small" variant="outlined">
                    ID: {{ entity.id }}
                  </v-chip>
                  <v-chip size="small" variant="outlined">
                    {{ entity.type }}
                  </v-chip>
                </div>
              </div>

              <div class="d-flex gap-2">
                <v-btn
                  color="primary"
                  variant="flat"
                  prepend-icon="mdi-pencil"
                  @click="editEntity"
                >
                  Edit
                </v-btn>
                <v-btn
                  variant="outlined"
                  prepend-icon="mdi-content-copy"
                  @click="duplicateEntity"
                >
                  Duplicate
                </v-btn>
                <v-menu>
                  <template #activator="{ props }">
                    <v-btn icon variant="text" v-bind="props">
                      <v-icon>mdi-dots-vertical</v-icon>
                    </v-btn>
                  </template>
                  <v-list>
                    <v-list-item @click="showEventHistory = !showEventHistory">
                      <v-list-item-title>
                        <v-icon start>mdi-history</v-icon>
                        {{ showEventHistory ? 'Hide' : 'Show' }} Event History
                      </v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="exportEntity">
                      <v-list-item-title>
                        <v-icon start>mdi-export</v-icon>
                        Export Data
                      </v-list-item-title>
                    </v-list-item>
                    <v-divider />
                    <v-list-item @click="confirmDelete" class="text-error">
                      <v-list-item-title>
                        <v-icon start>mdi-delete</v-icon>
                        Delete Entity
                      </v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </div>
            </div>

            <!-- Entity Metadata -->
            <v-divider class="my-4" />
            <div class="entity-metadata">
              <v-row>
                <v-col cols="6" md="3">
                  <div class="text-caption text-medium-emphasis">Created</div>
                  <div class="text-body-2">{{ formatDate(entity.createdAt) }}</div>
                </v-col>
                <v-col cols="6" md="3">
                  <div class="text-caption text-medium-emphasis">Last Modified</div>
                  <div class="text-body-2">{{ formatDate(entity.updatedAt) }}</div>
                </v-col>
                <v-col cols="6" md="3">
                  <div class="text-caption text-medium-emphasis">Version</div>
                  <div class="text-body-2">{{ entity.version || '1.0' }}</div>
                </v-col>
                <v-col cols="6" md="3">
                  <div class="text-caption text-medium-emphasis">Sync Status</div>
                  <v-chip
                    :color="entity.synced ? 'success' : 'warning'"
                    size="small"
                  >
                    {{ entity.synced ? 'Synced' : 'Unsynced' }}
                  </v-chip>
                </v-col>
              </v-row>
            </div>
          </v-card-text>
        </v-card>

        <!-- Entity Data Sections -->
        <v-row>
          <!-- Main Entity Data -->
          <v-col cols="12" lg="8">
            <v-card class="mb-6">
              <v-card-title>
                <v-icon class="mr-2">mdi-file-document</v-icon>
                Entity Data
              </v-card-title>
              <v-card-text>
                <div v-if="entity.data" class="entity-data">
                  <!-- This would render the actual form data based on schema -->
                  <pre>{{ JSON.stringify(entity.data, null, 2) }}</pre>
                </div>
                <div v-else class="text-center pa-6">
                  <v-icon size="64" color="grey-lighten-2" class="mb-4">mdi-file-document-outline</v-icon>
                  <p class="text-body-2 text-medium-emphasis">No data available</p>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Sidebar Information -->
          <v-col cols="12" lg="4">
            <!-- Quick Actions -->
            <v-card class="mb-6">
              <v-card-title class="text-h6">
                <v-icon class="mr-2">mdi-lightning-bolt</v-icon>
                Quick Actions
              </v-card-title>
              <v-card-text>
                <div class="d-flex flex-column gap-2">
                  <v-btn
                    variant="outlined"
                    block
                    prepend-icon="mdi-sync"
                    @click="syncEntity"
                  >
                    Sync Now
                  </v-btn>
                  <v-btn
                    variant="outlined"
                    block
                    prepend-icon="mdi-share"
                    @click="shareEntity"
                  >
                    Share
                  </v-btn>
                  <v-btn
                    variant="outlined"
                    block
                    prepend-icon="mdi-printer"
                    @click="printEntity"
                  >
                    Print
                  </v-btn>
                </div>
              </v-card-text>
            </v-card>

            <!-- Entity Statistics -->
            <v-card class="mb-6">
              <v-card-title class="text-h6">
                <v-icon class="mr-2">mdi-chart-bar</v-icon>
                Statistics
              </v-card-title>
              <v-card-text>
                <div class="d-flex flex-column gap-3">
                  <div class="d-flex justify-space-between">
                    <span class="text-body-2">Events</span>
                    <v-chip size="small">{{ eventHistory.length }}</v-chip>
                  </div>
                  <div class="d-flex justify-space-between">
                    <span class="text-body-2">Size</span>
                    <span class="text-body-2">{{ getEntitySize() }}</span>
                  </div>
                  <div class="d-flex justify-space-between">
                    <span class="text-body-2">Last Sync</span>
                    <span class="text-body-2">{{ entity.lastSync || 'Never' }}</span>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Event History Section -->
        <v-expand-transition>
          <div v-if="showEventHistory">
            <EventHistory
              :events="eventHistory"
              :loading="loadingEvents"
              @view-event="viewEvent"
              @revert-event="revertEvent"
              @load-more="loadMoreEvents"
            />
          </div>
        </v-expand-transition>
      </div>

      <!-- Delete Confirmation Dialog -->
      <ConfirmDialog
        v-model="showDeleteDialog"
        title="Delete Entity"
        :message="`Are you sure you want to delete '${entity?.name}'? This action cannot be undone and will remove all associated data.`"
        confirm-text="Delete"
        confirm-color="error"
        @confirm="deleteEntity"
        @cancel="showDeleteDialog = false"
      />
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import EventHistory from '@/components/EventHistory.vue'
import LoadingState from '@/components/LoadingState.vue'
import ErrorState from '@/components/ErrorState.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const loadingEvents = ref(false)
const error = ref('')
const showEventHistory = ref(false)
const showDeleteDialog = ref(false)

// Mock entity data - in real implementation, this would come from store/API
const entity = ref<any>(null)
const eventHistory = ref<any[]>([])

const navigationItems = [
  { title: 'Back to List', icon: 'mdi-arrow-left', to: `/app/${route.params.id}/${route.params.entity}` },
  { title: 'Edit Entity', icon: 'mdi-pencil', to: `/app/${route.params.id}/${route.params.entity}/${route.params.guid}/edit` }
]

const entityColor = computed(() => {
  const colors: Record<string, string> = {
    'active': 'primary',
    'inactive': 'grey',
    'pending': 'warning',
    'draft': 'info'
  }
  return colors[entity.value?.status] || 'primary'
})

const entityIcon = computed(() => {
  const icons: Record<string, string> = {
    'Individual': 'mdi-account',
    'Household': 'mdi-home-group',
    'Group': 'mdi-account-group',
    'Beneficiary': 'mdi-hand-heart'
  }
  return icons[entity.value?.type] || 'mdi-file-document'
})

const syncStatus = computed(() => {
  return entity.value?.synced ? 'synced' : 'offline'
})

const loadEntity = async () => {
  try {
    loading.value = true
    error.value = ''

    // Mock entity loading
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Generate mock entity
    entity.value = {
      id: route.params.guid as string,
      name: `Entity ${route.params.guid}`,
      description: 'This is a detailed description of the entity with all relevant information.',
      type: (route.params.entity as string) || 'Individual',
      status: 'active',
      version: '1.0',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      lastSync: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      synced: true,
      data: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        address: '123 Main St, City, Country',
        dateOfBirth: '1990-01-01',
        nationality: 'Example Country'
      }
    }

    // Load event history
    await loadEventHistory()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load entity'
  } finally {
    loading.value = false
  }
}

const loadEventHistory = async () => {
  try {
    loadingEvents.value = true

    // Mock event history loading
    await new Promise(resolve => setTimeout(resolve, 800))

    // Generate mock events
    eventHistory.value = [
      {
        id: 'event-1',
        type: 'create',
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        user: 'admin@example.com',
        data: { message: 'Entity created' }
      },
      {
        id: 'event-2',
        type: 'update',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        user: 'admin@example.com',
        data: { fields: ['firstName', 'email'] }
      },
      {
        id: 'event-3',
        type: 'update',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        user: 'user@example.com',
        data: { fields: ['phone', 'address'] }
      },
      {
        id: 'event-4',
        type: 'sync',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        user: 'system',
        data: { status: 'success' }
      }
    ]
  } catch (err) {
    console.error('Failed to load event history:', err)
  } finally {
    loadingEvents.value = false
  }
}

const goBack = () => {
  router.back()
}

const editEntity = () => {
  router.push(`/app/${route.params.id}/${route.params.entity}/${route.params.guid}/edit`)
}

const duplicateEntity = () => {
  // Implement duplication logic
  console.log('Duplicating entity:', entity.value?.id)
}

const exportEntity = () => {
  // Implement export logic
  console.log('Exporting entity:', entity.value?.id)
}

const syncEntity = async () => {
  // Implement sync logic
  console.log('Syncing entity:', entity.value?.id)
}

const shareEntity = () => {
  // Implement share logic
  console.log('Sharing entity:', entity.value?.id)
}

const printEntity = () => {
  // Implement print logic
  window.print()
}

const viewEvent = (event: any) => {
  // Show event details modal or navigate to event view
  console.log('Viewing event:', event.id)
}

const revertEvent = (event: any) => {
  // Show confirmation dialog for event reversion
  console.log('Reverting event:', event.id)
}

const loadMoreEvents = () => {
  // Load more events if pagination is needed
  console.log('Loading more events...')
}

const confirmDelete = () => {
  showDeleteDialog.value = true
}

const deleteEntity = async () => {
  try {
    // Implement delete logic
    console.log('Deleting entity:', entity.value?.id)
    showDeleteDialog.value = false
    // Navigate back after deletion
    router.back()
  } catch (err) {
    console.error('Failed to delete entity:', err)
  }
}

const handleLogout = async () => {
  // Implement logout logic
  router.push('/')
}

const handleSync = async () => {
  // Implement sync logic
  console.log('Syncing...')
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString()
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    'active': 'success',
    'inactive': 'error',
    'pending': 'warning',
    'draft': 'info'
  }
  return colors[status] || 'primary'
}

const getEntitySize = () => {
  if (!entity.value?.data) return '0 B'
  const size = JSON.stringify(entity.value.data).length
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

onMounted(() => {
  loadEntity()
})
</script>

<style scoped>
.entity-detail-view {
  max-width: 1200px;
  margin: 0 auto;
}

.entity-content {
  min-height: 60vh;
}

.entity-metadata {
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  padding: 1rem;
}

.entity-data pre {
  background-color: #f5f5f5;
  padding: 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  max-height: 400px;
  overflow-y: auto;
}
</style>