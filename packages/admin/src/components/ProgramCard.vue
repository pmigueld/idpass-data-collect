<script setup lang="ts">
import {
  getAppConfigJsonUrl,
  getAppQrCodeUrl,
  deleteApp as deleteAppApi,
  externalSync as externalSyncApi,
} from '@/api'
import BasicAuthDialog from '@/components/BasicAuthDialog.vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

interface Props {
  program: {
    id: string
    artifactId: string
    name: string
    version: string
    entitiesCount: number
    externalSync: Record<string, string>
  }
}

const { program } = defineProps<Props>()

const showDialog = ref(false)

const emit = defineEmits<{
  (e: 'programDeleted'): void
}>()

const menu = ref(false)
const menuPosition = ref({ x: 0, y: 0 })

const deleteProgram = async (id: string) => {
  try {
    await deleteAppApi(id)
    emit('programDeleted')
  } catch (error) {
    console.error('Error:', error)
    alert('Error deleting program config')
  }
}

const externalSync = async (id: string) => {
  try {
    if (program.externalSync?.auth === 'basic') {
      showDialog.value = true
      return
    }

    await externalSyncApi(id)
  } catch (error) {
    console.error('Error:', error)
  }
}

const onCredentialsSubmit = async (credentials: { username: string; password: string }) => {
  try {
    await externalSyncApi(program.id, credentials)
  } catch (error) {
    console.error('Error:', error)
  }
}

const editProgram = async (id: string) => {
  router.push(`/programs/edit/${id}`)
}

const copyProgram = async (id: string) => {
  router.push(`/programs/copy/${id}`)
}
</script>

<template>
  <v-card class="program-card" elevation="2">
    <v-card-header class="program-card-header">
      <div class="d-flex justify-space-between align-center w-100">
        <div class="program-info">
          <h3 class="program-name text-h6 font-weight-bold">{{ program.name }}</h3>
          <p class="program-id text-caption text-medium-emphasis">ID: {{ program.id }}</p>
        </div>
        <v-menu v-model="menu" location="end">
          <template v-slot:activator="{ props }">
            <v-btn icon="mdi-dots-vertical" variant="text" size="small" v-bind="props" />
          </template>
          <v-list>
            <v-list-item
              :href="getAppConfigJsonUrl(program.artifactId)"
              download
              prepend-icon="mdi-download"
              title="Download Config"
            />
            <v-list-item @click="externalSync(program.id)" prepend-icon="mdi-sync" title="Sync" />
            <v-list-item @click="editProgram(program.id)" prepend-icon="mdi-pencil" title="Edit" />
            <v-list-item @click="copyProgram(program.id)" prepend-icon="mdi-content-copy" title="Copy" />
            <v-divider />
            <v-list-item
              @click="deleteProgram(program.id)"
              prepend-icon="mdi-delete"
              title="Delete"
              color="error"
            />
          </v-list>
        </v-menu>
      </div>
    </v-card-header>

    <v-card-text class="program-card-content">
      <v-row class="mb-3">
        <v-col cols="6">
          <div class="stat-item">
            <v-icon size="20" color="primary" class="mb-1">mdi-account-group</v-icon>
            <div class="stat-label">Entities</div>
            <div class="stat-value">{{ program.entitiesCount || 0 }}</div>
          </div>
        </v-col>
        <v-col cols="6">
          <div class="stat-item">
            <v-icon size="20" color="success" class="mb-1">mdi-tag</v-icon>
            <div class="stat-label">Version</div>
            <div class="stat-value">{{ program.version }}</div>
          </div>
        </v-col>
      </v-row>

      <div class="qr-section">
        <v-img
          :src="getAppQrCodeUrl(program.artifactId)"
          alt="QR Code"
          max-width="80"
          class="mx-auto mb-2"
        />
        <p class="text-caption text-center text-medium-emphasis">
          Scan to load on mobile
        </p>
      </div>
    </v-card-text>

    <v-card-actions class="program-card-actions">
      <v-btn
        color="primary"
        variant="outlined"
        size="small"
        @click="externalSync(program.id)"
        prepend-icon="mdi-sync"
      >
        Sync
      </v-btn>
      <v-spacer />
      <v-btn
        color="primary"
        variant="flat"
        size="small"
        @click="editProgram(program.id)"
        prepend-icon="mdi-pencil"
      >
        Edit
      </v-btn>
    </v-card-actions>
  </v-card>

  <BasicAuthDialog
    :title="`Sync ${program.name}`"
    :description="`Enter your credentials to sync ${program.name}`"
    v-model="showDialog"
    @submit="onCredentialsSubmit"
  />
</template>

<style scoped>
.program-card {
  height: 100%;
  border-radius: 12px;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
}

.program-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.program-card-header {
  padding: 1.5rem 1.5rem 0 1.5rem;
}

.program-info {
  flex: 1;
  min-width: 0;
}

.program-name {
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.program-id {
  margin: 0.25rem 0 0 0;
}

.program-card-content {
  flex: 1;
  padding: 0 1.5rem 1rem 1.5rem;
}

.stat-item {
  text-align: center;
  padding: 0.5rem;
  border-radius: 8px;
  background-color: #f8f9fa;
}

.stat-label {
  font-size: 0.75rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
}

.qr-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
}

.program-card-actions {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e0e0e0;
  margin-top: auto;
}
</style>

