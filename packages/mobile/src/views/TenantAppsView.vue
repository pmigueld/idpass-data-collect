<template>
  <AppLayout
    title="Tenant Applications"
    :sync-status="globalSyncStatus"
    :navigation-items="navigationItems"
    @logout="handleLogout"
    @sync="handleSync"
  >
    <div class="tenant-apps-view">
      <!-- Header Section -->
      <div class="d-flex justify-space-between align-center mb-6">
        <div>
          <h1 class="text-h4 mb-1">Tenant Applications</h1>
          <p class="text-body-1 text-medium-emphasis">
            Manage and configure your data collection applications
          </p>
        </div>

        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="showCreateDialog = true"
        >
          Add Application
        </v-btn>
      </div>

      <!-- Search and Filter -->
      <SearchFilter
        v-model:search="searchQuery"
        :filter-options="filterOptions"
        :sort-options="sortOptions"
        class="mb-4"
        @search="handleSearch"
        @filter="handleFilter"
        @sort="handleSort"
      />

      <!-- Loading State -->
      <LoadingState v-if="loading" message="Loading applications..." />

      <!-- Error State -->
      <ErrorState
        v-else-if="error"
        :message="error"
        show-retry
        @retry="loadTenantApps"
      />

      <!-- Applications Grid -->
      <div v-else-if="filteredApps.length > 0" class="apps-grid">
        <v-row>
          <v-col
            v-for="app in paginatedApps"
            :key="app.id"
            cols="12"
            md="6"
            lg="4"
          >
            <TenantAppVersionSelector
              :tenant-app="app"
              :entity-count="getEntityCount(app.id)"
              :sync-status="getSyncStatus()"
              :available-versions="getAvailableVersions()"
              :version-history="getVersionHistory()"
              :show-version-history="true"
              @access="selectTenantApp(app)"
              @version-change="handleVersionChange"
              @view-details="viewAppDetails(app)"
              @edit="editTenantApp(app)"
            />
          </v-col>
        </v-row>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state text-center pa-8">
        <v-icon size="80" color="grey-lighten-2" class="mb-4">mdi-application-cog</v-icon>
        <h2 class="text-h5 mb-2">No Applications Found</h2>
        <p class="text-body-1 text-medium-emphasis mb-4">
          {{ searchQuery ? 'Try adjusting your search or filter criteria' : 'No tenant applications are currently configured' }}
        </p>
        <div class="d-flex justify-center gap-2">
          <v-btn
            v-if="searchQuery"
            variant="outlined"
            @click="clearSearch"
          >
            Clear Search
          </v-btn>
          <v-btn
            color="primary"
            @click="showCreateDialog = true"
          >
            <v-icon start>mdi-plus</v-icon>
            Add Application
          </v-btn>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="d-flex justify-center mt-6">
        <v-pagination
          v-model="currentPage"
          :length="totalPages"
          :total-visible="5"
          @update:model-value="handlePageChange"
        />
      </div>

      <!-- Statistics Footer -->
      <v-card class="mt-6" variant="outlined">
        <v-card-text>
          <div class="d-flex justify-space-around text-center">
            <div>
              <div class="text-h6">{{ filteredApps.length }}</div>
              <div class="text-caption text-medium-emphasis">Total Apps</div>
            </div>
            <div>
              <div class="text-h6">{{ totalEntities }}</div>
              <div class="text-caption text-medium-emphasis">Total Entities</div>
            </div>
            <div>
              <div class="text-h6">{{ syncedApps }}</div>
              <div class="text-caption text-medium-emphasis">Synced Apps</div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </div>

    <!-- Create/Edit Dialog -->
    <ConfirmDialog
      v-model="showCreateDialog"
      title="Add New Application"
      message="This feature will be implemented in the next phase."
      confirm-text="Coming Soon"
      :show-cancel="false"
      @confirm="showCreateDialog = false"
    />

    <!-- Version Change Dialog -->
    <ConfirmDialog
      v-model="showVersionDialog"
      :title="`Change Version to ${selectedVersion}?`"
      message="Changing the application version may affect data compatibility. Make sure to sync your data first."
      confirm-text="Change Version"
      @confirm="confirmVersionChange"
      @cancel="cancelVersionChange"
    />
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import SearchFilter from '@/components/SearchFilter.vue'
import TenantAppVersionSelector from '@/components/TenantAppVersionSelector.vue'
import LoadingState from '@/components/LoadingState.vue'
import ErrorState from '@/components/ErrorState.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { useTenantStore } from '@/store/tenant'
import { useAuthManagerStore } from '@/store/authManager'
import type { TenantAppData } from '@/schemas/tenantApp.schema'

const router = useRouter()
const tenantStore = useTenantStore()
const authStore = useAuthManagerStore()

const loading = ref(false)
const error = ref('')
const searchQuery = ref('')
const selectedFilter = ref('all')
const selectedSort = ref('name-asc')
const currentPage = ref(1)
const itemsPerPage = ref(9)

const showCreateDialog = ref(false)
const showVersionDialog = ref(false)
const selectedVersion = ref('')
const versionChangeTarget = ref<TenantAppData | null>(null)

const filterOptions = [
  { label: 'All Applications', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'With Entities', value: 'has-entities' },
  { label: 'Synced', value: 'synced' }
]

const sortOptions = [
  { label: 'Name (A-Z)', value: 'name-asc' },
  { label: 'Name (Z-A)', value: 'name-desc' },
  { label: 'Version (Newest)', value: 'version-desc' },
  { label: 'Version (Oldest)', value: 'version-asc' },
  { label: 'Entity Count', value: 'entities-desc' }
]

const navigationItems = [
  { title: 'Home', icon: 'mdi-home', to: '/' },
  { title: 'Applications', icon: 'mdi-view-grid', to: '/apps' },
  { title: 'Settings', icon: 'mdi-cog', to: '/settings' }
]

const filteredApps = computed(() => {
  let apps = [...tenantStore.tenantApps]

  // Apply search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    apps = apps.filter(app =>
      app.name.toLowerCase().includes(query) ||
      app.description.toLowerCase().includes(query)
    )
  }

  // Apply filters
  if (selectedFilter.value !== 'all') {
    apps = apps.filter(app => {
      switch (selectedFilter.value) {
        case 'active':
          return true // Would need actual status field
        case 'has-entities':
          return getEntityCount(app.id) > 0
        case 'synced':
          return Math.random() > 0.5 // Mock sync status
        default:
          return true
      }
    })
  }

  // Apply sorting
  apps.sort((a, b) => {
    switch (selectedSort.value) {
      case 'name-asc':
        return a.name.localeCompare(b.name)
      case 'name-desc':
        return b.name.localeCompare(a.name)
      case 'version-desc':
        return b.version.localeCompare(a.version)
      case 'version-asc':
        return a.version.localeCompare(b.version)
      case 'entities-desc':
        return getEntityCount(b.id) - getEntityCount(a.id)
      default:
        return 0
    }
  })

  return apps
})

const totalPages = computed(() =>
  Math.ceil(filteredApps.value.length / itemsPerPage.value)
)

const paginatedApps = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredApps.value.slice(start, end)
})

const totalEntities = computed(() =>
  filteredApps.value.reduce((sum, app) => sum + getEntityCount(app.id), 0)
)

const syncedApps = computed(() =>
  filteredApps.value.filter(() => Math.random() > 0.5).length
)

const globalSyncStatus = computed(() => {
  if (filteredApps.value.length === 0) return 'offline'
  if (syncedApps.value === filteredApps.value.length) return 'synced'
  if (syncedApps.value > 0) return 'syncing'
  return 'offline'
})

const loadTenantApps = async () => {
  try {
    loading.value = true
    error.value = ''
    await tenantStore.loadTenantApps()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load applications'
  } finally {
    loading.value = false
  }
}

const handleSearch = (query: string) => {
  searchQuery.value = query
  currentPage.value = 1
}

const handleFilter = (filter: string) => {
  selectedFilter.value = filter
  currentPage.value = 1
}

const handleSort = (sort: string) => {
  selectedSort.value = sort
}

const handlePageChange = (page: number) => {
  currentPage.value = page
}

const clearSearch = () => {
  searchQuery.value = ''
  currentPage.value = 1
}

const selectTenantApp = (app: TenantAppData) => {
  router.push(`/app/${app.id}`)
}

const viewAppDetails = (app: TenantAppData) => {
  // Navigate to app details view
  console.log('View details for app:', app.id)
}

const editTenantApp = (app: TenantAppData) => {
  // Navigate to edit app view
  console.log('Edit app:', app.id)
}

const handleVersionChange = (version: string) => {
  // Version change logic would be implemented here
  console.log('Version change requested:', version)
}

const confirmVersionChange = () => {
  if (versionChangeTarget.value) {
    // Implement version change logic
    console.log('Changing version for app:', versionChangeTarget.value.id, 'to', selectedVersion.value)
  }
  showVersionDialog.value = false
  versionChangeTarget.value = null
}

const cancelVersionChange = () => {
  showVersionDialog.value = false
  versionChangeTarget.value = null
}

const handleLogout = async () => {
  try {
    await authStore.logout()
    router.push('/')
  } catch (err) {
    console.error('Logout failed:', err)
  }
}

const handleSync = async () => {
  // Implement global sync logic
  console.log('Syncing all applications...')
}

const getEntityCount = (appId: string) => {
  // This would need to be implemented based on actual entity counting
  return Math.floor(Math.random() * 100) // Placeholder
}

const getSyncStatus = () => {
  return 'unknown'
}

const getAvailableVersions = (appId: string) => {
  return tenantStore.getAvailableVersions(appId)
}

const getVersionHistory = (appId: string) => {
  return tenantStore.getVersionHistory(appId)
}

onMounted(() => {
  loadTenantApps()
})
</script>

<style scoped>
.tenant-apps-view {
  max-width: 1400px;
  margin: 0 auto;
}

.apps-grid {
  min-height: 400px;
}

.empty-state {
  background: rgba(255, 255, 255, 0.5);
  border-radius: 16px;
  margin: 2rem auto;
  max-width: 600px;
}
</style>