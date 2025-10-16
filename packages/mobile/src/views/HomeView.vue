<template>
  <div class="home-view">
    <!-- Welcome Header -->
    <div class="welcome-section text-center mb-6">
      <v-icon size="80" color="primary" class="mb-4">mdi-view-dashboard</v-icon>
      <h1 class="text-h4 mb-2">Welcome to ID PASS DataCollect</h1>
      <p class="text-h6 text-medium-emphasis">
        Select an application to start collecting and managing data
      </p>
    </div>

    <!-- Loading State -->
    <LoadingState v-if="loading" />

    <!-- Error State -->
    <ErrorState
      v-else-if="error"
      :message="error"
      show-retry
      @retry="loadTenantApps"
    />

    <!-- Tenant App Selection -->
    <div v-else-if="tenantApps.length > 0" class="apps-section">
      <div class="d-flex justify-space-between align-center mb-4">
        <h2 class="text-h5">Available Applications</h2>
        <v-chip color="primary" variant="outlined">
          {{ tenantApps.length }} Available
        </v-chip>
      </div>

      <v-row>
        <v-col
          v-for="app in tenantApps"
          :key="app.id"
          cols="12"
          md="6"
          lg="4"
        >
          <TenantAppVersionSelector
            :tenant-app="app"
            :entity-count="getEntityCount(app.id)"
            :sync-status="getSyncStatus(app.id)"
            :available-versions="getAvailableVersions(app.id)"
            :version-history="getVersionHistory(app.id)"
            @access="selectTenantApp(app)"
            @view-details="viewAppDetails(app)"
          />
        </v-col>
      </v-row>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state text-center pa-8">
      <v-icon size="80" color="grey-lighten-2" class="mb-4">mdi-application-cog</v-icon>
      <h2 class="text-h5 mb-2">No Applications Available</h2>
      <p class="text-body-1 text-medium-emphasis mb-4">
        No tenant applications are currently configured.
        Please contact your administrator to set up applications.
      </p>
      <v-btn
        color="primary"
        variant="outlined"
        @click="loadTenantApps"
      >
        <v-icon start>mdi-refresh</v-icon>
        Refresh
      </v-btn>
    </div>

    <!-- Quick Actions (if authenticated) -->
    <div v-if="isAuthenticated" class="quick-actions mt-8">
      <v-divider class="mb-4" />
      <div class="d-flex justify-center gap-3">
        <v-btn
          variant="outlined"
          color="primary"
          @click="$router.push('/settings')"
        >
          <v-icon start>mdi-cog</v-icon>
          Settings
        </v-btn>
        <v-btn
          variant="outlined"
          color="secondary"
          @click="showAbout = true"
        >
          <v-icon start>mdi-information</v-icon>
          About
        </v-btn>
      </div>
    </div>

    <!-- About Dialog -->
    <v-dialog v-model="showAbout" max-width="500">
      <v-card>
        <v-card-title>
          <v-icon class="mr-2" color="primary">mdi-information</v-icon>
          About ID PASS DataCollect
        </v-card-title>
        <v-card-text>
          <p class="text-body-1 mb-3">
            ID PASS DataCollect is an offline-first data management system for
            household and individual beneficiary data collection.
          </p>
          <p class="text-body-2 text-medium-emphasis">
            Version 2.0.0 | Built with Vue 3, Vuetify 3, and Capacitor
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showAbout = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTenantStore } from '@/store/tenant'
import { useAuthManagerStore } from '@/store/authManager'
import TenantAppVersionSelector from '@/components/TenantAppVersionSelector.vue'
import LoadingState from '@/components/LoadingState.vue'
import ErrorState from '@/components/ErrorState.vue'

const router = useRouter()
const tenantStore = useTenantStore()
const authStore = useAuthManagerStore()

const loading = ref(false)
const error = ref('')
const showAbout = ref(false)

const tenantApps = ref(tenantStore.tenantApps)
const isAuthenticated = ref(authStore.isAuthenticated)

const loadTenantApps = async () => {
  try {
    loading.value = true
    error.value = ''
    await tenantStore.loadTenantApps()
    tenantApps.value = tenantStore.tenantApps
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load applications'
  } finally {
    loading.value = false
  }
}

const selectTenantApp = (app: any) => {
  router.push(`/app/${app.id}`)
}

const viewAppDetails = (app: any) => {
  // Navigate to app details or show modal
  console.log('View details for app:', app.id)
}

const getEntityCount = (appId: string) => {
  // This would need to be implemented based on actual entity counting
  return 0
}

const getSyncStatus = (appId: string) => {
  return tenantStore.getSyncStatus(appId)
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
.home-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem 1rem;
}

.welcome-section {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  padding: 3rem 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.apps-section {
  max-width: 1200px;
  margin: 0 auto;
}

.quick-actions {
  max-width: 600px;
  margin: 0 auto;
}

.empty-state {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  margin: 2rem auto;
  max-width: 600px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}
</style>