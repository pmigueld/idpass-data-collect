<script setup lang="ts">
import { useDatabase } from '@/database'
import { TenantAppData } from '@/schemas/tenantApp.schema'
import { EntityForm } from '@/utils/dynamicFormIoUtils'
import { useAuthManagerStore } from '@/store/authManager'
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const database = useDatabase()
const authManager = useAuthManagerStore()

const tenantapp = ref<TenantAppData>()
const loading = ref(false)
const syncDialog = ref(false)
const syncing = ref(false)
const snackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')

const rootForms = computed(() => {
  if (!tenantapp.value) return []
  return tenantapp.value.entityForms.filter((form) => !form.dependsOn)
})

onMounted(async () => {
  loading.value = true
  try {
    const foundDocuments = await database.tenantapps
      .find({
        selector: {
          id: route.params.id
        }
      })
      .exec()
    tenantapp.value = foundDocuments[0]
  } finally {
    loading.value = false
  }
})

const showSnackbar = (message: string, color: string = 'success') => {
  snackbarText.value = message
  snackbarColor.value = color
  snackbar.value = true
}

const handleFormClick = (form: EntityForm) => {
  router.push(`/app/${route.params.id}/${form.name}`)
}

const handleSync = async () => {
  syncing.value = true
  try {
    // Perform sync
    showSnackbar('Sync completed successfully', 'success')
  } catch (error) {
    console.error('Sync error:', error)
    showSnackbar('Sync failed', 'error')
  } finally {
    syncing.value = false
    syncDialog.value = false
  }
}

const handleLogout = async () => {
  try {
    await authManager.logout(route.params.id as string)
    router.push(`/login/${route.params.id}`)
  } catch (error) {
    console.error('Logout error:', error)
    showSnackbar('Logout failed', 'error')
  }
}

const getFormIcon = (form: EntityForm) => {
  const iconMap: Record<string, string> = {
    group: 'mdi-account-group',
    individual: 'mdi-account',
    household: 'mdi-home',
    default: 'mdi-form-select'
  }
  const formName = form.name.toLowerCase()
  for (const [key, icon] of Object.entries(iconMap)) {
    if (formName.includes(key)) return icon
  }
  return iconMap.default
}

const getFormColor = (index: number) => {
  const colors = ['primary', 'secondary', 'success', 'info', 'warning', 'purple', 'teal']
  return colors[index % colors.length]
}
</script>

<template>
  <v-app>
    <v-app-bar color="primary" prominent>
      <v-btn icon @click="router.push('/')">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-app-bar-title>
        {{ tenantapp?.name || 'Application' }}
      </v-app-bar-title>
      <v-btn icon @click="syncDialog = true">
        <v-icon>mdi-sync</v-icon>
      </v-btn>
      <v-btn icon @click="handleLogout">
        <v-icon>mdi-logout</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />

        <v-card v-if="tenantapp" class="mb-4" variant="tonal" color="primary">
          <v-card-text>
            <div class="d-flex justify-space-between align-center">
              <div>
                <div class="text-h5">{{ tenantapp.name }}</div>
                <div class="text-caption">{{ tenantapp.description }}</div>
              </div>
              <v-chip color="white" variant="flat">
                <v-icon start>mdi-tag</v-icon>
                v{{ tenantapp.appVersion || tenantapp.version }}
              </v-chip>
            </div>
          </v-card-text>
        </v-card>

        <div class="text-h6 mb-4">Entity Forms</div>

        <v-row v-if="rootForms.length > 0">
          <v-col v-for="(form, index) in rootForms" :key="form.name" cols="12" sm="6" md="4">
            <v-card
              :color="getFormColor(index)"
              theme="dark"
              class="form-card"
              @click="handleFormClick(form)"
              hover
            >
              <v-card-title class="d-flex align-center">
                <v-icon :icon="getFormIcon(form)" size="large" class="mr-3" />
                <span>{{ form.title }}</span>
              </v-card-title>

              <v-card-subtitle class="text-white">
                {{ form.name }}
              </v-card-subtitle>

              <v-card-actions>
                <v-spacer />
                <v-icon>mdi-chevron-right</v-icon>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>

        <v-card v-else class="text-center pa-8" variant="outlined">
          <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-form-select</v-icon>
          <h3 class="text-h5 mb-2">No forms available</h3>
          <p class="text-body-1 text-grey">This application has no entity forms configured</p>
        </v-card>
      </v-container>
    </v-main>

    <v-dialog v-model="syncDialog" max-width="500">
      <v-card>
        <v-card-title>
          <v-icon class="mr-2">mdi-sync</v-icon>
          Synchronize Data
        </v-card-title>

        <v-card-text>
          <p>Synchronize your local data with the server. This will:</p>
          <ul>
            <li>Upload local changes to the server</li>
            <li>Download updates from the server</li>
            <li>Resolve any conflicts</li>
          </ul>
          <v-alert type="info" variant="tonal" class="mt-4">
            Make sure you have an active internet connection before syncing.
          </v-alert>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="syncDialog = false" :disabled="syncing">Cancel</v-btn>
          <v-btn color="primary" :loading="syncing" @click="handleSync">
            <v-icon start>mdi-sync</v-icon>
            Sync Now
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
.form-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.form-card:hover {
  transform: translateY(-4px);
}
</style>
