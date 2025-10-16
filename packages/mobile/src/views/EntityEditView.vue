<template>
  <AppLayout
    :title="`Edit ${entity?.name || 'Entity'}`"
    :sync-status="syncStatus"
    :navigation-items="navigationItems"
    @logout="handleLogout"
    @sync="handleSync"
  >
    <div class="entity-edit-view">
      <!-- Loading State -->
      <LoadingState v-if="loading" message="Loading entity for editing..." />

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
        message="The entity you are trying to edit could not be found."
        show-back
        @back="goBack"
      />

      <!-- Edit Form -->
      <div v-else>
        <!-- Form Header -->
        <v-card class="mb-6" elevation="2">
          <v-card-text class="pa-6">
            <div class="d-flex align-center">
              <v-avatar size="48" :color="entityColor" class="mr-4">
                <v-icon size="24" color="white">{{ entityIcon }}</v-icon>
              </v-avatar>

              <div class="flex-grow-1">
                <h1 class="text-h5 mb-1">Edit {{ entity.name }}</h1>
                <p class="text-body-2 text-medium-emphasis">
                  Update the entity information below. Changes will be saved as a new version.
                </p>
              </div>

              <div class="d-flex gap-2">
                <v-chip
                  :color="getStatusColor(entity.status)"
                  size="small"
                >
                  {{ entity.status }}
                </v-chip>
                <v-chip size="small" variant="outlined">
                  Version {{ entity.version || '1.0' }}
                </v-chip>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <!-- Form Content -->
        <EntityForm
          :title="`Edit ${entity.name}`"
          :icon="entityIcon"
          :color="entityColor"
          :initial-data="formData"
          :saving="saving"
          submit-text="Save Changes"
          @submit="saveEntity"
          @cancel="goBack"
          @close="goBack"
        />

        <!-- Version Information -->
        <v-card class="mt-6" variant="outlined">
          <v-card-title class="text-h6">
            <v-icon class="mr-2">mdi-information</v-icon>
            Version Information
          </v-card-title>
          <v-card-text>
            <div class="d-flex justify-space-between align-center mb-3">
              <span class="text-body-2">Current Version:</span>
              <v-chip size="small" color="primary">
                {{ entity.version || '1.0' }}
              </v-chip>
            </div>
            <div class="d-flex justify-space-between align-center mb-3">
              <span class="text-body-2">Last Modified:</span>
              <span class="text-body-2">{{ formatDate(entity.updatedAt) }}</span>
            </div>
            <div class="d-flex justify-space-between align-center">
              <span class="text-body-2">Changes will create:</span>
              <v-chip size="small" color="success">
                Version {{ nextVersion }}
              </v-chip>
            </div>
          </v-card-text>
        </v-card>

        <!-- Recent Changes Preview -->
        <v-card class="mt-4" variant="outlined">
          <v-card-title class="text-h6">
            <v-icon class="mr-2">mdi-history</v-icon>
            Recent Changes Preview
          </v-card-title>
          <v-card-text>
            <div v-if="hasChanges" class="changes-preview">
              <v-alert
                type="info"
                variant="tonal"
                class="mb-4"
              >
                The following changes will be recorded when you save:
              </v-alert>

              <div class="d-flex flex-column gap-2">
                <div
                  v-for="(change, field) in detectedChanges"
                  :key="field"
                  class="d-flex align-center pa-2 rounded"
                  :class="change.type === 'modified' ? 'bg-blue-lighten-5' : 'bg-green-lighten-5'"
                >
                  <v-icon
                    size="16"
                    :color="change.type === 'modified' ? 'primary' : 'success'"
                    class="mr-2"
                  >
                    {{ change.type === 'modified' ? 'mdi-pencil' : 'mdi-plus' }}
                  </v-icon>
                  <span class="text-body-2">
                    <strong>{{ field }}:</strong>
                    {{ change.type === 'modified' ? 'Modified' : 'Added' }}
                  </span>
                </div>
              </div>
            </div>

            <div v-else class="text-center pa-6">
              <v-icon size="48" color="grey-lighten-2" class="mb-3">mdi-check-circle</v-icon>
              <p class="text-body-2 text-medium-emphasis">No changes detected</p>
            </div>
          </v-card-text>
        </v-card>
      </div>

      <!-- Unsaved Changes Warning -->
      <v-dialog v-model="showUnsavedDialog" max-width="400">
        <v-card>
          <v-card-title>
            <v-icon class="mr-2" color="warning">mdi-alert</v-icon>
            Unsaved Changes
          </v-card-title>
          <v-card-text>
            You have unsaved changes. Are you sure you want to leave without saving?
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn variant="text" @click="showUnsavedDialog = false">
              Cancel
            </v-btn>
            <v-btn color="warning" variant="flat" @click="confirmLeave">
              Leave Without Saving
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import EntityForm from '@/components/EntityForm.vue'
import LoadingState from '@/components/LoadingState.vue'
import ErrorState from '@/components/ErrorState.vue'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const saving = ref(false)
const error = ref('')
const hasUnsavedChanges = ref(false)
const showUnsavedDialog = ref(false)
const nextRoute = ref('')

// Mock entity data - in real implementation, this would come from store/API
const entity = ref<any>(null)
const originalData = ref<any>(null)
const formData = ref<any>({})

const navigationItems = [
  { title: 'Back to Entity', icon: 'mdi-arrow-left', to: `/app/${route.params.id}/${route.params.entity}/${route.params.guid}/detail` },
  { title: 'View History', icon: 'mdi-history', to: `/app/${route.params.id}/${route.params.entity}/${route.params.guid}/history` }
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

const nextVersion = computed(() => {
  const current = parseFloat(entity.value?.version || '1.0')
  return (current + 0.1).toFixed(1)
})

const hasChanges = computed(() => {
  if (!originalData.value || !formData.value) return false
  return JSON.stringify(originalData.value) !== JSON.stringify(formData.value)
})

const detectedChanges = computed(() => {
  if (!hasChanges.value) return {}

  const changes: Record<string, { type: 'modified' | 'added' }> = {}

  // Compare original and current data to detect changes
  Object.keys(formData.value).forEach(key => {
    if (!(key in originalData.value)) {
      changes[key] = { type: 'added' }
    } else if (JSON.stringify(formData.value[key]) !== JSON.stringify(originalData.value[key])) {
      changes[key] = { type: 'modified' }
    }
  })

  return changes
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

    // Store original data for change detection
    originalData.value = JSON.parse(JSON.stringify(entity.value.data))
    formData.value = { ...entity.value.data }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load entity'
  } finally {
    loading.value = false
  }
}

const saveEntity = async (data: any) => {
  try {
    saving.value = true

    // Mock save operation
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Update entity data
    entity.value.data = { ...data }
    entity.value.updatedAt = new Date().toISOString()
    entity.value.version = nextVersion.value

    // Reset change detection
    originalData.value = JSON.parse(JSON.stringify(entity.value.data))
    hasUnsavedChanges.value = false

    // Show success message and navigate back
    console.log('Entity saved successfully')
    router.push(`/app/${route.params.id}/${route.params.entity}/${route.params.guid}/detail`)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to save entity'
  } finally {
    saving.value = false
  }
}

const goBack = () => {
  if (hasUnsavedChanges.value) {
    showUnsavedDialog.value = true
  } else {
    router.back()
  }
}

const confirmLeave = () => {
  showUnsavedDialog.value = false
  router.back()
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

// Watch for form changes to detect unsaved changes

// Handle browser back button
const handleBeforeUnload = (e: BeforeUnloadEvent) => {
  if (hasUnsavedChanges.value) {
    e.preventDefault()
    e.returnValue = ''
  }
}

// Handle route changes
const handleRouteChange = (to: any) => {
  if (hasUnsavedChanges.value && to.name !== route.name) {
    nextRoute.value = to.fullPath
    showUnsavedDialog.value = true
    return false
  }
  return true
}

onMounted(() => {
  loadEntity()
  window.addEventListener('beforeunload', handleBeforeUnload)

  // Watch for route changes
  const routerGuard = router.beforeEach(handleRouteChange)
  onUnmounted(() => {
    routerGuard()
    window.removeEventListener('beforeunload', handleBeforeUnload)
  })
})
</script>

<style scoped>
.entity-edit-view {
  max-width: 800px;
  margin: 0 auto;
}

.changes-preview {
  max-height: 300px;
  overflow-y: auto;
}
</style>