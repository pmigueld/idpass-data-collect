<template>
  <AppLayout
    :title="`${currentEntityType} Entities`"
    :sync-status="syncStatus"
    :navigation-items="navigationItems"
    @logout="handleLogout"
    @sync="handleSync"
  >
    <div class="entity-list-view">
      <!-- Header Section -->
      <div class="d-flex justify-space-between align-center mb-6">
        <div>
          <h1 class="text-h4 mb-1">{{ currentEntityType }} Entities</h1>
          <p class="text-body-1 text-medium-emphasis">
            Manage and view your {{ currentEntityType.toLowerCase() }} data
          </p>
        </div>

        <div class="d-flex gap-2">
          <v-btn
            variant="outlined"
            color="primary"
            prepend-icon="mdi-filter-variant"
            @click="showFilters = !showFilters"
          >
            Filters
          </v-btn>
          <v-btn
            color="primary"
            prepend-icon="mdi-plus"
            @click="createNewEntity"
          >
            Add {{ currentEntityType }}
          </v-btn>
        </div>
      </div>

      <!-- Search and Filter -->
      <SearchFilter
        v-model:search="searchQuery"
        :filter-options="entityFilterOptions"
        :sort-options="entitySortOptions"
        class="mb-4"
        @search="handleSearch"
        @filter="handleFilter"
        @sort="handleSort"
      />

      <!-- Advanced Filters Panel -->
      <v-expand-transition>
        <v-card v-if="showFilters" class="mb-4" variant="outlined">
          <v-card-text>
            <v-row>
              <v-col cols="12" md="3">
                <v-select
                  v-model="dateFilter"
                  :items="dateFilterOptions"
                  label="Date Range"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
              <v-col cols="12" md="3">
                <v-text-field
                  v-model="dateFrom"
                  label="From Date"
                  type="date"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
              <v-col cols="12" md="3">
                <v-text-field
                  v-model="dateTo"
                  label="To Date"
                  type="date"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
              <v-col cols="12" md="3">
                <v-btn
                  variant="outlined"
                  color="primary"
                  @click="applyDateFilter"
                >
                  Apply Filter
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-expand-transition>

      <!-- Loading State -->
      <LoadingState v-if="loading" :message="`Loading ${currentEntityType.toLowerCase()} entities...`" />

      <!-- Error State -->
      <ErrorState
        v-else-if="error"
        :message="error"
        show-retry
        @retry="loadEntities"
      />

      <!-- Entities List -->
      <div v-else-if="filteredEntities.length > 0" class="entities-section">
        <!-- Results Summary -->
        <div class="d-flex justify-space-between align-center mb-4">
          <div class="text-body-1">
            Showing {{ paginatedEntities.length }} of {{ filteredEntities.length }} entities
          </div>
          <v-chip color="primary" variant="outlined">
            {{ currentEntityType }}
          </v-chip>
        </div>

        <!-- Entity Cards -->
        <v-row>
          <v-col
            v-for="entity in paginatedEntities"
            :key="entity.id"
            cols="12"
            md="6"
            lg="4"
          >
            <EntityCard
              :title="entity.name || `Entity ${entity.id}`"
              :subtitle="getEntitySubtitle(entity)"
              :description="getEntityDescription(entity)"
              :icon="getEntityIcon(currentEntityType)"
              :color="getEntityColor(entity.status)"
              :status="entity.status"
              :metadata="getEntityMetadata(entity)"
              action-icon="mdi-chevron-right"
              @click="viewEntity(entity)"
              @action="viewEntity(entity)"
            />
          </v-col>
        </v-row>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state text-center pa-8">
        <v-icon size="80" color="grey-lighten-2" class="mb-4">{{ getEntityIcon(currentEntityType) }}</v-icon>
        <h2 class="text-h5 mb-2">No {{ currentEntityType }} Entities Found</h2>
        <p class="text-body-1 text-medium-emphasis mb-4">
          {{ searchQuery || selectedFilter !== 'all' ?
            'Try adjusting your search or filter criteria' :
            `No ${currentEntityType.toLowerCase()} entities have been created yet` }}
        </p>
        <div class="d-flex justify-center gap-2">
          <v-btn
            v-if="searchQuery || selectedFilter !== 'all'"
            variant="outlined"
            @click="clearFilters"
          >
            Clear Filters
          </v-btn>
          <v-btn
            color="primary"
            @click="createNewEntity"
          >
            <v-icon start>mdi-plus</v-icon>
            Add {{ currentEntityType }}
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
              <div class="text-h6">{{ filteredEntities.length }}</div>
              <div class="text-caption text-medium-emphasis">Total Entities</div>
            </div>
            <div>
              <div class="text-h6">{{ activeEntities }}</div>
              <div class="text-caption text-medium-emphasis">Active</div>
            </div>
            <div>
              <div class="text-h6">{{ syncedEntities }}</div>
              <div class="text-caption text-medium-emphasis">Synced</div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import SearchFilter from '@/components/SearchFilter.vue'
import EntityCard from '@/components/EntityCard.vue'
import LoadingState from '@/components/LoadingState.vue'
import ErrorState from '@/components/ErrorState.vue'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const error = ref('')
const searchQuery = ref('')
const selectedFilter = ref('all')
const selectedSort = ref('name-asc')
const currentPage = ref(1)
const itemsPerPage = ref(12)
const showFilters = ref(false)

// Date filtering
const dateFilter = ref('all')
const dateFrom = ref('')
const dateTo = ref('')

// Mock data - in real implementation, this would come from store/API
const entities = ref<any[]>([])
const currentEntityType = ref('')

const dateFilterOptions = [
  { title: 'All Time', value: 'all' },
  { title: 'Last 7 days', value: 'week' },
  { title: 'Last 30 days', value: 'month' },
  { title: 'Custom Range', value: 'custom' }
]

const entityFilterOptions = [
  { label: 'All Entities', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Pending', value: 'pending' },
  { label: 'Draft', value: 'draft' }
]

const entitySortOptions = [
  { label: 'Name (A-Z)', value: 'name-asc' },
  { label: 'Name (Z-A)', value: 'name-desc' },
  { label: 'Date Created (Newest)', value: 'created-desc' },
  { label: 'Date Created (Oldest)', value: 'created-asc' },
  { label: 'Last Modified', value: 'modified-desc' }
]

const navigationItems = [
  { title: 'Back to App', icon: 'mdi-arrow-left', to: `/app/${route.params.id}` },
  { title: 'All Entities', icon: 'mdi-view-list', to: `/app/${route.params.id}/entities` }
]

const filteredEntities = computed(() => {
  let filtered = [...entities.value]

  // Apply search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(entity =>
      (entity.name && entity.name.toLowerCase().includes(query)) ||
      (entity.description && entity.description.toLowerCase().includes(query)) ||
      (entity.id && entity.id.toLowerCase().includes(query))
    )
  }

  // Apply status filter
  if (selectedFilter.value !== 'all') {
    filtered = filtered.filter(entity => entity.status === selectedFilter.value)
  }

  // Apply date filter
  if (dateFrom.value || dateTo.value) {
    filtered = filtered.filter(entity => {
      const entityDate = new Date(entity.createdAt || entity.timestamp)
      const from = dateFrom.value ? new Date(dateFrom.value) : null
      const to = dateTo.value ? new Date(dateTo.value) : null

      if (from && entityDate < from) return false
      if (to && entityDate > to) return false
      return true
    })
  }

  // Apply sorting
  filtered.sort((a, b) => {
    switch (selectedSort.value) {
      case 'name-asc':
        return (a.name || '').localeCompare(b.name || '')
      case 'name-desc':
        return (b.name || '').localeCompare(a.name || '')
      case 'created-desc':
        return new Date(b.createdAt || b.timestamp).getTime() - new Date(a.createdAt || a.timestamp).getTime()
      case 'created-asc':
        return new Date(a.createdAt || a.timestamp).getTime() - new Date(b.createdAt || b.timestamp).getTime()
      case 'modified-desc':
        return new Date(b.updatedAt || b.timestamp).getTime() - new Date(a.updatedAt || a.timestamp).getTime()
      default:
        return 0
    }
  })

  return filtered
})

const totalPages = computed(() =>
  Math.ceil(filteredEntities.value.length / itemsPerPage.value)
)

const paginatedEntities = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredEntities.value.slice(start, end)
})

const activeEntities = computed(() =>
  filteredEntities.value.filter(e => e.status === 'active').length
)

const syncedEntities = computed(() =>
  filteredEntities.value.filter(e => e.synced).length
)

const syncStatus = computed(() => {
  if (filteredEntities.value.length === 0) return 'offline'
  if (syncedEntities.value === filteredEntities.value.length) return 'synced'
  if (syncedEntities.value > 0) return 'syncing'
  return 'offline'
})

const loadEntities = async () => {
  try {
    loading.value = true
    error.value = ''

    // Get entity type from route or default
    currentEntityType.value = (route.params.entity as string) || 'Entity'

    // Mock data loading - in real implementation, this would fetch from store/API
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Generate mock entities based on entity type
    entities.value = generateMockEntities(currentEntityType.value, 25)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load entities'
  } finally {
    loading.value = false
  }
}

const generateMockEntities = (type: string, count: number) => {
  const types: Record<string, { icon: string, color: string }> = {
    'individual': { icon: 'mdi-account', color: 'primary' },
    'household': { icon: 'mdi-home-group', color: 'success' },
    'group': { icon: 'mdi-account-group', color: 'info' },
    'beneficiary': { icon: 'mdi-hand-heart', color: 'warning' }
  }

  const config = types[currentEntityType.value.toLowerCase()] || { icon: 'mdi-file-document', color: 'grey' }

  return Array.from({ length: count }, (_, i) => ({
    id: `entity-${i + 1}`,
    name: `${type} ${i + 1}`,
    description: `This is a ${type.toLowerCase()} entity with various properties and metadata.`,
    status: ['active', 'inactive', 'pending', 'draft'][Math.floor(Math.random() * 4)],
    type: type.toLowerCase(),
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    synced: Math.random() > 0.3,
    metadata: {
      'Created': new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      'Last Modified': new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      'Version': '1.0',
      'Source': 'Mobile App'
    }
  }))
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

const clearFilters = () => {
  searchQuery.value = ''
  selectedFilter.value = 'all'
  selectedSort.value = 'name-asc'
  dateFilter.value = 'all'
  dateFrom.value = ''
  dateTo.value = ''
  currentPage.value = 1
}

const applyDateFilter = () => {
  // Date filter is already applied in computed property
  // This method can be used for additional logic if needed
}

const createNewEntity = () => {
  router.push(`/app/${route.params.id}/${currentEntityType.toLowerCase()}/new`)
}

const viewEntity = (entity: any) => {
  router.push(`/app/${route.params.id}/${currentEntityType.toLowerCase()}/${entity.id}/detail`)
}

const handleLogout = async () => {
  // Implement logout logic
  router.push('/')
}

const handleSync = async () => {
  // Implement sync logic
  console.log('Syncing entities...')
}

const getEntitySubtitle = (entity: any) => {
  return `Created ${new Date(entity.createdAt).toLocaleDateString()}`
}

const getEntityDescription = (entity: any) => {
  return entity.description || 'No description available'
}

const getEntityIcon = (entityType: string) => {
  const icons: Record<string, string> = {
    'Individual': 'mdi-account',
    'Household': 'mdi-home-group',
    'Group': 'mdi-account-group',
    'Beneficiary': 'mdi-hand-heart'
  }
  return icons[entityType] || 'mdi-file-document'
}

const getEntityColor = (status: string) => {
  const colors: Record<string, string> = {
    'active': 'success',
    'inactive': 'error',
    'pending': 'warning',
    'draft': 'info'
  }
  return colors[status] || 'primary'
}

const getEntityMetadata = (entity: any) => {
  return entity.metadata || {}
}

onMounted(() => {
  loadEntities()
})

watch(() => route.params.entity, () => {
  loadEntities()
})
</script>

<style scoped>
.entity-list-view {
  max-width: 1400px;
  margin: 0 auto;
}

.entities-section {
  min-height: 400px;
}

.empty-state {
  background: rgba(255, 255, 255, 0.5);
  border-radius: 16px;
  margin: 2rem auto;
  max-width: 600px;
}
</style>