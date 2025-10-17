<script setup lang="ts">
import {
  createApp as createAppApi,
  getApps as getAppsApi,
  type AppListItem,
  type AppListMeta,
  type AppListParams,
} from '@/api'
import ProgramCard from '@/components/ProgramCard.vue'
import { useAuthStore } from '@/stores/auth'
import { AxiosError } from 'axios'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const authStore = useAuthStore()

const programs = ref<AppListItem[]>([])
const meta = ref<AppListMeta>({
  total: 0,
  page: 1,
  pageSize: 12,
  totalPages: 0,
  sortBy: 'name',
  sortOrder: 'asc',
  search: '',
})

const page = ref(1)
const pageSize = ref(12)
const sortBy = ref<AppListParams['sortBy']>('name')
const sortOrder = ref<AppListParams['sortOrder']>('asc')
const searchTerm = ref('')
const isLoading = ref(false)

const selectedFile = ref<File | null>(null)
const fileError = ref<string | null>(null)

const sortByOptions = [
  { title: 'Name', value: 'name' },
  { title: 'ID', value: 'id' },
  { title: 'Entities Count', value: 'entitiesCount' },
]

const sortOrderOptions = [
  { title: 'Ascending', value: 'asc' },
  { title: 'Descending', value: 'desc' },
]

const pageSizeOptions = [6, 12, 24, 48].map((value) => ({
  title: `${value} per page`,
  value,
}))

const hasNoResults = computed(() => !isLoading.value && programs.value.length === 0)
const totalPrograms = computed(() => meta.value.total)

let searchDebounce: ReturnType<typeof setTimeout> | undefined

const fetchPrograms = async () => {
  isLoading.value = true
  try {
    const response = await getAppsApi({
      page: page.value,
      pageSize: pageSize.value,
      sortBy: sortBy.value,
      sortOrder: sortOrder.value,
      search: searchTerm.value.trim() || undefined,
    })
    programs.value = response.data
    meta.value = response.meta
    if (page.value !== response.meta.page) {
      page.value = response.meta.page
    }
    if (pageSize.value !== response.meta.pageSize) {
      pageSize.value = response.meta.pageSize
    }
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      authStore.logout()
      return
    }
    console.error('Error fetching programs:', error)
  } finally {
    isLoading.value = false
  }
}

watch(page, () => {
  fetchPrograms()
})

watch(pageSize, () => {
  page.value = 1
  fetchPrograms()
})

watch(sortBy, () => {
  page.value = 1
  fetchPrograms()
})

watch(sortOrder, () => {
  page.value = 1
  fetchPrograms()
})

watch(
  searchTerm,
  () => {
    if (searchDebounce) {
      clearTimeout(searchDebounce)
    }
    searchDebounce = setTimeout(() => {
      page.value = 1
      fetchPrograms()
    }, 300)
  },
)

const uploadProgramConfig = async () => {
  if (!selectedFile.value) return

  try {
    const fileReader = new FileReader()
    fileReader.onload = async (event: ProgressEvent<FileReader>) => {
      try {
        const json = JSON.parse(event.target?.result as string)

        if (!json || typeof json !== 'object') {
          throw new Error('Invalid program configuration format')
        }

        const formData = new FormData()
        formData.append(
          'config',
          new Blob([JSON.stringify(json)], {
            type: 'application/json',
          }),
          'config.json',
        )

        await createAppApi(formData)
        selectedFile.value = null
        fileError.value = null
        await fetchPrograms()
      } catch (error) {
        if (error instanceof AxiosError && error.response?.status === 401) {
          authStore.logout()
          return
        }
        console.error('Error uploading configuration:', error)
        fileError.value =
          error instanceof Error ? error.message : 'Error uploading program configuration'
      }
    }

    fileReader.onerror = () => {
      console.error('Error reading file')
      fileError.value = 'Failed to read the configuration file'
    }

    fileReader.readAsText(selectedFile.value)
  } catch (error) {
    console.error('Error:', error)
    fileError.value = 'Error uploading program configuration'
  }
}

onMounted(() => {
  fetchPrograms()
})

onBeforeUnmount(() => {
  if (searchDebounce) {
    clearTimeout(searchDebounce)
  }
})
</script>

<template>
  <div class="dashboard-container">
    <!-- Header Section -->
    <div class="dashboard-header">
      <div class="d-flex justify-space-between align-center">
        <div>
          <h1 class="text-h3 font-weight-bold text-primary mb-2">
            Collection Programs
          </h1>
          <p class="text-h6 text-medium-emphasis mb-0">
            Manage your data collection programs and configurations
          </p>
        </div>
        <v-btn
          color="primary"
          size="large"
          prepend-icon="mdi-plus"
          :to="{ name: 'create' }"
          class="create-program-btn"
        >
          Create Program
        </v-btn>
      </div>
    </div>

    <!-- Upload Section -->
    <v-card class="upload-card mb-6">
      <v-card-text class="pa-6">
        <div class="d-flex align-center">
          <div class="flex-grow-1">
            <h3 class="text-h6 mb-2">Upload Program Configuration</h3>
            <p class="text-body-1 text-medium-emphasis mb-0">
              Import a JSON configuration file to create a new collection program
            </p>
          </div>
          <v-file-input
            v-model="selectedFile"
            accept=".json"
            label="Choose JSON Config File"
            prepend-icon="mdi-upload"
            :error-messages="fileError"
            @change="uploadProgramConfig"
            class="upload-input"
          />
        </div>
      </v-card-text>
    </v-card>

    <!-- Filters and Search -->
    <v-card class="filters-card mb-6">
      <v-card-text class="pa-6">
        <v-row>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="searchTerm"
              label="Search Programs"
              prepend-inner-icon="mdi-magnify"
              clearable
              hint="Search by name, ID, or description"
              persistent-hint
            />
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-select
              v-model="sortBy"
              :items="sortByOptions"
              label="Sort By"
              item-title="title"
              item-value="value"
            />
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-select
              v-model="sortOrder"
              :items="sortOrderOptions"
              label="Order"
              item-title="title"
              item-value="value"
            />
          </v-col>
          <v-col cols="12" sm="6" md="2">
            <v-select
              v-model="pageSize"
              :items="pageSizeOptions"
              label="Show"
              item-title="title"
              item-value="value"
            />
          </v-col>
          <v-col cols="12" class="text-end">
            <v-chip size="large" color="primary" variant="outlined">
              {{ totalPrograms }} Programs
            </v-chip>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Loading Indicator -->
    <v-progress-linear v-if="isLoading" color="primary" indeterminate class="mb-4" />

    <!-- Programs Grid -->
    <div v-if="programs.length" class="programs-grid">
      <v-row>
        <v-col v-for="program in programs" :key="program.id" cols="12" sm="6" lg="4">
          <ProgramCard :program="program" @program-deleted="fetchPrograms" />
        </v-col>
      </v-row>
    </div>

    <!-- Empty State -->
    <div v-else-if="hasNoResults" class="empty-state">
      <v-card class="pa-8 text-center">
        <v-icon size="80" color="grey-lighten-2" class="mb-4">mdi-package-variant-closed</v-icon>
        <h3 class="text-h5 mb-2">No Programs Found</h3>
        <p class="text-body-1 text-medium-emphasis mb-4">
          {{ searchTerm ? 'Try adjusting your search terms or filters.' : 'Get started by creating your first collection program.' }}
        </p>
        <v-btn color="primary" :to="{ name: 'create' }" prepend-icon="mdi-plus">
          Create Your First Program
        </v-btn>
      </v-card>
    </div>

    <!-- Pagination -->
    <div v-if="meta.totalPages > 1" class="d-flex justify-center mt-8">
      <v-pagination
        v-model="page"
        :length="meta.totalPages"
        :total-visible="7"
        color="primary"
      />
    </div>
  </div>
</template>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  padding: 2rem;
  background-color: #f8f9fa;
}

.dashboard-header {
  margin-bottom: 3rem;
}

.create-program-btn {
  min-width: 200px;
}

.upload-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.upload-input {
  max-width: 300px;
}

.filters-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.programs-grid {
  margin-top: 2rem;
}

.empty-state {
  margin-top: 4rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .dashboard-container {
    padding: 1rem;
  }

  .dashboard-header .d-flex {
    flex-direction: column;
    align-items: flex-start !important;
    gap: 1rem;
  }

  .create-program-btn {
    width: 100%;
    min-width: auto;
  }
}
</style>
