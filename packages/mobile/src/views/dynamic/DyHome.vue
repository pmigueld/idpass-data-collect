<script setup lang="ts">
import { useDatabase } from '@/database'
import { TenantAppData } from '@/schemas/tenantApp.schema'
import { Barcode, BarcodeScanner } from '@capacitor-mlkit/barcode-scanning'
import { Camera } from '@capacitor/camera'
import { Capacitor } from '@capacitor/core'
import { onMounted, onUnmounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const isMobile = ref(['android', 'ios'].includes(Capacitor.getPlatform()))
const isGrantedPermissions = ref(false)
const isDevelop = import.meta.env.VITE_DEVELOP === 'true'
const loading = ref(false)
const searchQuery = ref('')

const database = useDatabase()
const tenantapps = ref<TenantAppData[]>([])
const showAddAppDialog = ref(false)
const appUrl = ref('')

const tenantappsDb = database.tenantapps.find()
const tenantappsSub = tenantappsDb.$.subscribe((results) => {
  tenantapps.value = results
})

// Computed properties for filtering and statistics
const filteredApps = computed(() => {
  if (!searchQuery.value) return tenantapps.value
  const query = searchQuery.value.toLowerCase()
  return tenantapps.value.filter(app =>
    app.name.toLowerCase().includes(query) ||
    app.description.toLowerCase().includes(query)
  )
})

const totalApps = computed(() => tenantapps.value.length)
const onlineApps = computed(() => tenantapps.value.filter(app => app.syncServerUrl).length)

onMounted(() => {})

onUnmounted(() => {
  tenantappsSub.unsubscribe()
})

// Enhanced app loading with better error handling
const loadApp = async (url: string) => {
  if (!url.trim()) {
    throw new Error('Please enter a valid URL')
  }

  loading.value = true
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to load app: ${response.status} ${response.statusText}`)
    }

    const json = await response.json()

    // Validate the app configuration
    if (!json.id || !json.name) {
      throw new Error('Invalid app configuration: missing required fields')
    }

    await database.tenantapps.upsert({
      ...json,
      url, // Store the source URL for reference
      lastUpdated: new Date().toISOString()
    })

    return json.name
  } catch (error) {
    console.error('Error loading app:', error)
    throw error
  } finally {
    loading.value = false
  }
}

// QR Code scanning with improved UX
const requestPermissions = async (): Promise<boolean> => {
  try {
    const { camera } = await Camera.requestPermissions()
    return camera === 'granted' || camera === 'limited'
  } catch (error) {
    console.error('Permission request failed:', error)
    return false
  }
}

const scanSingleBarcode = async (): Promise<Barcode> => {
  return new Promise(async (resolve, reject) => {
    try {
      document.querySelector('body')?.classList.add('barcode-scanner-active')

      const listener = await BarcodeScanner.addListener('barcodeScanned', async (result) => {
        await listener.remove()
        document.querySelector('body')?.classList.remove('barcode-scanner-active')
        await BarcodeScanner.stopScan()
        resolve(result.barcode)
      })

      await BarcodeScanner.startScan()
    } catch (error) {
      document.querySelector('body')?.classList.remove('barcode-scanner-active')
      reject(error)
    }
  })
}

const scanQRCode = async () => {
  if (!isGrantedPermissions.value) {
    const granted = await requestPermissions()
    isGrantedPermissions.value = granted
    if (!granted) {
      throw new Error('Camera permission is required to scan QR codes')
    }
  }

  try {
    const code = await scanSingleBarcode()
    return code.displayValue
  } catch (error) {
    console.error('QR scan failed:', error)
    throw new Error('Failed to scan QR code. Please try again.')
  }
}

// Dialog handlers
const handleAddApp = async () => {
  if (isMobile.value) {
    try {
      const url = await scanQRCode()
      const appName = await loadApp(url)
      // Show success message
      console.log(`Successfully loaded app: ${appName}`)
    } catch (error) {
      console.error('Failed to add app:', error)
      // Show error message to user
    }
  } else {
    showAddAppDialog.value = true
  }
}

const handleLoadAppFromInput = async () => {
  try {
    await loadApp(appUrl.value)
    showAddAppDialog.value = false
    appUrl.value = ''
  } catch (error) {
    console.error('Failed to load app from URL:', error)
    // Show error message
  }
}

// Navigation
const handleClickApp = (appId: string) => {
  router.push(`/app/${appId}`)
}

// Developer utilities
const clearAllData = async () => {
  try {
    await database.tenantapps.remove()
    localStorage.clear()
    sessionStorage.clear()
    window.location.reload()
  } catch (error) {
    console.error('Failed to clear data:', error)
  }
}

// Format dates for display
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}
</script>

<template>
  <div class="tenant-apps-view">
    <!-- Header Section -->
    <div class="d-flex justify-space-between align-center mb-4">
      <div>
        <h1 class="text-h5 font-weight-bold mb-1">Tenant Applications</h1>
        <p class="text-body-2 text-medium-emphasis mb-0">
          {{ totalApps }} apps • {{ onlineApps }} with sync enabled
        </p>
      </div>

      <!-- Search -->
      <v-text-field
        v-model="searchQuery"
        prepend-inner-icon="mdi-magnify"
        label="Search apps"
        single-line
        hide-details
        density="comfortable"
        variant="outlined"
        class="max-width-300"
      />
    </div>

    <!-- Loading indicator -->
    <v-progress-linear
      v-if="loading"
      indeterminate
      color="primary"
      class="mb-4"
    />

    <!-- Empty state -->
    <v-card
      v-if="!loading && filteredApps.length === 0 && !searchQuery"
      class="modern-card text-center pa-8"
      variant="tonal"
    >
      <v-icon size="64" color="primary" class="mb-4">mdi-apps</v-icon>
      <h3 class="text-h6 mb-2">No Applications Found</h3>
      <p class="text-body-1 text-medium-emphasis mb-4">
        Get started by adding your first tenant application
      </p>
      <p class="text-body-2 text-medium-emphasis">
        Scan a QR code or enter a configuration URL to begin
      </p>
    </v-card>

    <!-- No search results -->
    <v-card
      v-else-if="!loading && filteredApps.length === 0 && searchQuery"
      class="modern-card text-center pa-8"
      variant="tonal"
    >
      <v-icon size="64" color="grey" class="mb-4">mdi-magnify</v-icon>
      <h3 class="text-h6 mb-2">No Results Found</h3>
      <p class="text-body-1 text-medium-emphasis">
        No applications match your search for "{{ searchQuery }}"
      </p>
    </v-card>

    <!-- Apps Grid/List -->
    <v-row v-else-if="filteredApps.length > 0" class="mb-4">
      <v-col
        v-for="app in filteredApps"
        :key="app.id"
        cols="12"
        md="6"
        lg="4"
      >
        <v-card
          class="modern-card modern-list-item h-100"
          variant="outlined"
          @click="handleClickApp(app.id)"
        >
          <v-card-text class="pa-4">
            <div class="d-flex align-center mb-3">
              <v-avatar color="primary" size="40" class="mr-3">
                <span class="text-white font-weight-bold">
                  {{ app.name.charAt(0).toUpperCase() }}
                </span>
              </v-avatar>

              <div class="flex-grow-1">
                <h3 class="text-h6 font-weight-bold mb-1 text-ellipsis">
                  {{ app.name }}
                </h3>
                <p class="text-body-2 text-medium-emphasis mb-0">
                  v{{ app.version }}
                </p>
              </div>

              <v-icon color="primary">mdi-chevron-right</v-icon>
            </div>

            <p class="text-body-2 mb-3" style="min-height: 3rem;">
              {{ app.description }}
            </p>

            <div class="d-flex justify-space-between align-center">
              <v-chip
                :color="app.syncServerUrl ? 'success' : 'warning'"
                size="small"
                variant="flat"
              >
                <v-icon start size="16">
                  {{ app.syncServerUrl ? 'mdi-wifi' : 'mdi-wifi-off' }}
                </v-icon>
                {{ app.syncServerUrl ? 'Online' : 'Offline' }}
              </v-chip>

              <span class="text-caption text-medium-emphasis">
                {{ formatDate(app.lastUpdated || new Date().toISOString()) }}
              </span>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Add App FAB -->
    <v-fab
      app
      location="bottom right"
      color="primary"
      @click="handleAddApp"
    >
      <v-icon>mdi-plus</v-icon>
    </v-fab>

    <!-- Add App Dialog -->
    <v-dialog v-model="showAddAppDialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="text-h6">Add Application</span>
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" @click="showAddAppDialog = false" />
        </v-card-title>

        <v-card-text>
          <v-text-field
            v-model="appUrl"
            label="Configuration URL"
            placeholder="https://example.com/app-config.json"
            variant="outlined"
            :rules="[v => !!v || 'URL is required']"
          />
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showAddAppDialog = false">
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            :loading="loading"
            @click="handleLoadAppFromInput"
          >
            Add Application
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Developer Tools (only in development) -->
    <v-card v-if="isDevelop" class="mt-4" variant="tonal" color="error">
      <v-card-text class="pa-3">
        <div class="d-flex justify-space-between align-center">
          <span class="text-body-2">Development Tools</span>
          <v-btn
            color="error"
            size="small"
            variant="outlined"
            @click="clearAllData"
          >
            Clear All Data
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<style scoped>
.tenant-apps-view {
  padding: 1rem;
}

.max-width-300 {
  max-width: 300px;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .tenant-apps-view {
    padding: 0.5rem;
  }

  .max-width-300 {
    max-width: none;
    width: 100%;
  }
}
</style>
