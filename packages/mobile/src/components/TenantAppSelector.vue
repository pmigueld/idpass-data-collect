<template>
  <div class="tenant-app-selector">
    <!-- Header -->
    <div class="text-center mb-6">
      <v-icon size="64" color="primary" class="mb-4">mdi-view-grid</v-icon>
      <h2 class="text-h5 mb-2">Select Application</h2>
      <p class="text-body-1 text-medium-emphasis">
        Choose an application to get started
      </p>
    </div>

    <!-- Search -->
    <v-text-field
      v-model="searchQuery"
      label="Search applications"
      prepend-inner-icon="mdi-magnify"
      clearable
      density="comfortable"
      class="mb-4"
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

    <!-- Tenant Apps Grid -->
    <div v-else-if="filteredApps.length > 0" class="apps-grid">
      <v-card
        v-for="app in filteredApps"
        :key="app.id"
        class="app-card"
        hover
        @click="selectApp(app)"
      >
        <v-card-text class="d-flex flex-column align-center text-center pa-4">
          <v-avatar size="48" color="primary" class="mb-3">
            <v-icon size="24" color="white">
              {{ getAppIcon(app.name) }}
            </v-icon>
          </v-avatar>

          <h6 class="text-h6 mb-2">{{ app.name }}</h6>

          <p class="text-body-2 text-medium-emphasis mb-3">
            {{ app.description }}
          </p>

          <!-- Version Badge -->
          <v-chip size="small" variant="outlined" class="mb-2">
            <v-icon start size="14">mdi-tag</v-icon>
            v{{ app.version }}
          </v-chip>

          <!-- Metadata -->
          <div class="d-flex flex-wrap gap-1 justify-center">
            <v-chip
              v-if="app.entityForms?.length"
              size="x-small"
              color="info"
              variant="flat"
            >
              {{ app.entityForms.length }} Forms
            </v-chip>

            <v-chip
              v-if="getSyncStatus(app)"
              size="x-small"
              :color="getSyncStatus(app) === 'synced' ? 'success' : 'warning'"
            >
              {{ getSyncStatus(app) }}
            </v-chip>
          </div>
        </v-card-text>
      </v-card>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center pa-8">
      <v-icon size="64" color="grey-lighten-2" class="mb-4">mdi-view-grid-outline</v-icon>
      <h3 class="text-h6 mb-2">No Applications Found</h3>
      <p class="text-body-2 text-medium-emphasis mb-4">
        {{ searchQuery ? 'Try adjusting your search terms' : 'No applications are currently available' }}
      </p>
      <v-btn
        v-if="searchQuery"
        variant="outlined"
        @click="searchQuery = ''"
      >
        Clear Search
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { TenantAppData } from '@/schemas/tenantApp.schema'
import { useTenantStore } from '@/store/tenant'
import LoadingState from '@/components/LoadingState.vue'
import ErrorState from '@/components/ErrorState.vue'

interface Props {
  loading?: boolean
  error?: string
}

interface Emits {
  (e: 'app-selected', app: TenantAppData): void
  (e: 'retry'): void
}

withDefaults(defineProps<Props>(), {
  loading: false,
  error: ''
})

const emit = defineEmits<Emits>()

const searchQuery = ref('')
const tenantStore = useTenantStore()

const filteredApps = computed(() => {
  if (!searchQuery.value) return tenantStore.tenantApps

  const query = searchQuery.value.toLowerCase()
  return tenantStore.tenantApps.filter(app =>
    app.name.toLowerCase().includes(query) ||
    app.description.toLowerCase().includes(query)
  )
})

const getAppIcon = (appName: string): string => {
  const icons: Record<string, string> = {
    'household': 'mdi-home-group',
    'individual': 'mdi-account-group',
    'beneficiary': 'mdi-hand-heart',
    'registration': 'mdi-clipboard-check',
    'survey': 'mdi-clipboard-list',
    'health': 'mdi-medical-bag',
    'education': 'mdi-school'
  }

  return icons[appName.toLowerCase()] || 'mdi-application'
}

const getSyncStatus = (app: TenantAppData): string | null => {
  // This would need to be implemented based on actual sync status logic
  return null // For now, return null to hide status
}

const selectApp = (app: any) => {
  emit('app-selected', app)
}

const loadTenantApps = () => {
  emit('retry')
}

onMounted(() => {
  if (tenantStore.tenantApps.length === 0) {
    loadTenantApps()
  }
})
</script>

<style scoped>
.tenant-app-selector {
  max-width: 800px;
  margin: 0 auto;
}

.apps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.app-card {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.app-card:hover {
  transform: translateY(-4px);
}
</style>