<script setup lang="ts">
import { useDatabase } from '@/database'
import { TenantAppData } from '@/schemas/tenantApp.schema'
import { Barcode, BarcodeScanner } from '@capacitor-mlkit/barcode-scanning'
import { Camera } from '@capacitor/camera'
import { Capacitor } from '@capacitor/core'
import { onMounted, onUnmounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const database = useDatabase()

const isMobile = ref(['android', 'ios'].includes(Capacitor.getPlatform()))
const isGrantedPermissions = ref(false)
const isDevelop = import.meta.env.VITE_DEVELOP === 'true'

const tenantapps = ref<TenantAppData[]>([])
const searchQuery = ref('')
const loadAppDialog = ref(false)
const appUrl = ref('')
const loading = ref(false)
const snackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')

const tenantappsDb = database.tenantapps.find()
const tenantappsSub = tenantappsDb.$.subscribe((results) => {
  tenantapps.value = results
})

const filteredApps = computed(() => {
  if (!searchQuery.value) return tenantapps.value
  const query = searchQuery.value.toLowerCase()
  return tenantapps.value.filter(
    (app) =>
      app.name.toLowerCase().includes(query) ||
      app.description?.toLowerCase().includes(query) ||
      app.metadata?.organization?.toLowerCase().includes(query)
  )
})

onMounted(() => {})

onUnmounted(() => {
  tenantappsSub.unsubscribe()
})

const showSnackbar = (message: string, color: string = 'success') => {
  snackbarText.value = message
  snackbarColor.value = color
  snackbar.value = true
}

const devHandleClickClearData = async () => {
  loading.value = true
  try {
    await database.tenantapps.remove()
    localStorage.clear()
    sessionStorage.clear()
    showSnackbar('All data cleared successfully', 'success')
    setTimeout(() => window.location.reload(), 1000)
  } catch (error) {
    showSnackbar('Error clearing data', 'error')
  } finally {
    loading.value = false
  }
}

const requestPermissions = async (): Promise<boolean> => {
  const { camera } = await Camera.requestPermissions()
  return camera === 'granted' || camera === 'limited'
}

const scanSingleBarcode = async (): Promise<Barcode> => {
  return new Promise(async (resolve) => {
    document.querySelector('body')?.classList.add('barcode-scanner-active')

    const listener = await BarcodeScanner.addListener('barcodeScanned', async (result) => {
      await listener.remove()
      document.querySelector('body')?.classList.remove('barcode-scanner-active')
      await BarcodeScanner.stopScan()
      resolve(result.barcode)
    })

    await BarcodeScanner.startScan()
  })
}

const scan = async () => {
  if (!isGrantedPermissions.value) {
    const granted = await requestPermissions()
    isGrantedPermissions.value = granted
    if (!granted) {
      showSnackbar('Camera permission denied', 'error')
      return
    }
  }

  const code = await scanSingleBarcode()
  return code.displayValue
}

const loadApp = async (url: string) => {
  loading.value = true
  try {
    const response = await fetch(url)
    const json = await response.json()
    await database.tenantapps.upsert({
      ...json,
      lastUpdated: new Date().toISOString(),
      appVersion: json.appVersion || json.version
    })
    showSnackbar('App loaded successfully', 'success')
  } catch (error) {
    console.error(error)
    showSnackbar('Error loading app', 'error')
    throw error
  } finally {
    loading.value = false
  }
}

const handleLoadAppFromInput = async () => {
  try {
    await loadApp(appUrl.value)
    loadAppDialog.value = false
    appUrl.value = ''
  } catch (error) {
    // Error already handled in loadApp
  }
}

const handleClickAddApp = async () => {
  if (isMobile.value) {
    try {
      const url = await scan()
      if (url) {
        await loadApp(url)
      }
    } catch (error) {
      console.error(error)
      showSnackbar('Error scanning QR code', 'error')
    }
  } else {
    loadAppDialog.value = true
  }
}

const handleClickApp = (appId: string) => {
  router.push('/app/' + appId)
}

const getAppIcon = (app: TenantAppData) => {
  return app.metadata?.icon || 'mdi-application'
}

const getAppColor = (index: number) => {
  const colors = ['primary', 'secondary', 'success', 'info', 'warning']
  return colors[index % colors.length]
}
</script>

<template>
  <v-app>
    <v-app-bar color="primary" prominent>
      <v-app-bar-title>
        <v-icon class="mr-2">mdi-application-array</v-icon>
        Applications
      </v-app-bar-title>
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <v-row>
          <v-col cols="12">
            <v-text-field
              v-model="searchQuery"
              prepend-inner-icon="mdi-magnify"
              label="Search applications"
              variant="outlined"
              clearable
              hide-details
              class="mb-4"
            />
          </v-col>
        </v-row>

        <v-row v-if="filteredApps.length === 0 && !searchQuery">
          <v-col cols="12">
            <v-card class="text-center pa-8" variant="outlined">
              <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-inbox</v-icon>
              <h3 class="text-h5 mb-2">No applications found</h3>
              <p class="text-body-1 text-grey">
                Click the camera button below to scan and add an application
              </p>
            </v-card>
          </v-col>
        </v-row>

        <v-row v-else-if="filteredApps.length === 0 && searchQuery">
          <v-col cols="12">
            <v-card class="text-center pa-8" variant="outlined">
              <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-magnify</v-icon>
              <h3 class="text-h5 mb-2">No results found</h3>
              <p class="text-body-1 text-grey">Try adjusting your search query</p>
            </v-card>
          </v-col>
        </v-row>

        <v-row v-else>
          <v-col v-for="(app, index) in filteredApps" :key="app.id" cols="12" sm="6" md="4">
            <v-card
              :color="getAppColor(index)"
              theme="dark"
              class="app-card"
              @click="handleClickApp(app.id)"
              hover
            >
              <v-card-title class="d-flex align-center">
                <v-icon :icon="getAppIcon(app)" size="large" class="mr-3" />
                <span class="text-truncate">{{ app.name }}</span>
              </v-card-title>

              <v-card-subtitle class="text-white">
                {{ app.description }}
              </v-card-subtitle>

              <v-card-text>
                <v-chip
                  v-if="app.appVersion || app.version"
                  size="small"
                  class="mr-2"
                  variant="outlined"
                >
                  <v-icon start>mdi-tag</v-icon>
                  v{{ app.appVersion || app.version }}
                </v-chip>

                <v-chip
                  v-if="app.metadata?.organization"
                  size="small"
                  variant="outlined"
                  class="mr-2"
                >
                  <v-icon start>mdi-office-building</v-icon>
                  {{ app.metadata.organization }}
                </v-chip>

                <div v-if="app.lastUpdated" class="text-caption mt-2 text-white">
                  Updated: {{ new Date(app.lastUpdated).toLocaleDateString() }}
                </div>

                <v-chip-group v-if="app.metadata?.tags && app.metadata.tags.length > 0" class="mt-2">
                  <v-chip
                    v-for="tag in app.metadata.tags"
                    :key="tag"
                    size="x-small"
                    variant="outlined"
                  >
                    {{ tag }}
                  </v-chip>
                </v-chip-group>
              </v-card-text>

              <v-card-actions>
                <v-spacer />
                <v-icon>mdi-chevron-right</v-icon>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>

        <v-row v-if="isDevelop" class="mt-4">
          <v-col cols="12">
            <v-btn
              color="error"
              block
              size="large"
              :loading="loading"
              @click="devHandleClickClearData"
            >
              <v-icon start>mdi-delete-sweep</v-icon>
              Clear All Data (Dev)
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <v-fab
      icon="mdi-camera"
      location="bottom end"
      size="large"
      color="primary"
      :loading="loading"
      @click="handleClickAddApp"
      app
      appear
    />

    <v-dialog v-model="loadAppDialog" max-width="500">
      <v-card>
        <v-card-title>
          <v-icon class="mr-2">mdi-download</v-icon>
          Load Application
        </v-card-title>

        <v-card-text>
          <v-text-field
            v-model="appUrl"
            label="Application URL"
            placeholder="https://example.com/app-config.json"
            variant="outlined"
            prepend-inner-icon="mdi-link"
            :rules="[(v) => !!v || 'URL is required']"
          />
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="loadAppDialog = false">Cancel</v-btn>
          <v-btn
            color="primary"
            :disabled="!appUrl"
            :loading="loading"
            @click="handleLoadAppFromInput"
          >
            Load
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="3000">
      {{ snackbarText }}
      <template #actions>
        <v-btn variant="text" @click="snackbar = false">Close</v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<style scoped>
.app-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.app-card:hover {
  transform: translateY(-4px);
}
</style>
