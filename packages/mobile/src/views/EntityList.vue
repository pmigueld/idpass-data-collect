<script setup lang="ts">
import { useDatabase } from '@/database'
import { TenantAppData } from '@/schemas/tenantApp.schema'
import { store } from '@/store'
import { EntityForm, getBreadcrumbFromPath } from '@/utils/dynamicFormIoUtils'
import { EntityDoc } from '@idpass/data-collect-core'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const database = useDatabase()

const props = defineProps<{
  id: string
  parentGuid: string
  entity: string
}>()

const tenantapp = ref<TenantAppData>()
const entityForm = ref<EntityForm>()
const storedEntityData = ref<
  {
    initial: EntityDoc
    modified: EntityDoc
  }[]
>([])
const loading = ref(false)
const searchQuery = ref('')
const sortBy = ref<'name' | 'date'>('name')
const sortOrder = ref<'asc' | 'desc'>('asc')

const filteredEntities = computed(() => {
  let filtered = [...storedEntityData.value]

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter((entity) => {
      const name = entity.modified.data.name?.toLowerCase() || ''
      const data = JSON.stringify(entity.modified.data).toLowerCase()
      return name.includes(query) || data.includes(query)
    })
  }

  // Sort entities
  filtered.sort((a, b) => {
    let comparison = 0
    if (sortBy.value === 'name') {
      const nameA = a.modified.data.name?.toLowerCase() || ''
      const nameB = b.modified.data.name?.toLowerCase() || ''
      comparison = nameA.localeCompare(nameB)
    } else {
      const dateA = new Date(a.modified.lastUpdated).getTime()
      const dateB = new Date(b.modified.lastUpdated).getTime()
      comparison = dateA - dateB
    }
    return sortOrder.value === 'asc' ? comparison : -comparison
  })

  return filtered
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

    entityForm.value = tenantapp.value.entityForms.find(
      (entity) => entity.name === route.params.entity
    )

    const entityData = await store.searchEntities([{ entityName: entityForm.value.name }])
    const entityList = entityData.filter((entity) => {
      if (!entity.modified.data.parentGuid) {
        return true
      }
      return entity.modified.data.parentGuid === props.parentGuid
    })

    storedEntityData.value = entityList
  } finally {
    loading.value = false
  }
})

const handleEntityClick = (guid: string) => {
  router.push(`${route.path}/${guid}/detail`)
}

const handleAddNew = () => {
  router.push(`${route.path}/new`)
}

const onBack = () => {
  router.go(-1)
}

const toggleSort = (field: 'name' | 'date') => {
  if (sortBy.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = field
    sortOrder.value = 'asc'
  }
}

const getEntitySubtitle = (entity: { initial: EntityDoc; modified: EntityDoc }) => {
  const data = entity.modified.data
  const keys = Object.keys(data).filter((k) => k !== 'name' && k !== 'parentGuid')
  if (keys.length > 0) {
    return `${keys.length} fields`
  }
  return 'No additional data'
}
</script>

<template>
  <v-app>
    <v-app-bar color="primary" prominent>
      <v-btn icon @click="onBack">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-app-bar-title>{{ entityForm?.title || entityForm?.name }}</v-app-bar-title>
      <v-btn icon @click="handleAddNew">
        <v-icon>mdi-plus</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <v-card class="mb-4" variant="tonal" color="primary">
          <v-card-text>
            <div class="d-flex justify-space-between align-center">
              <div>
                <div class="text-h6">{{ entityForm?.name }}</div>
                <div class="text-caption">Total: {{ filteredEntities.length }} entities</div>
              </div>
              <v-chip color="white" variant="flat">
                <v-icon start>mdi-database</v-icon>
                {{ storedEntityData.length }}
              </v-chip>
            </div>
          </v-card-text>
        </v-card>

        <v-breadcrumbs :items="getBreadcrumbFromPath(route.path).split(' > ')" class="pa-0 mb-4">
          <template #divider>
            <v-icon>mdi-chevron-right</v-icon>
          </template>
        </v-breadcrumbs>

        <v-card class="mb-4">
          <v-card-text>
            <v-row>
              <v-col cols="12" md="8">
                <v-text-field
                  v-model="searchQuery"
                  prepend-inner-icon="mdi-magnify"
                  label="Search entities"
                  variant="outlined"
                  clearable
                  hide-details
                  density="comfortable"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-btn-toggle v-model="sortBy" mandatory color="primary" class="mr-2">
                  <v-btn value="name" @click="toggleSort('name')">
                    <v-icon>mdi-sort-alphabetical-{{ sortOrder === 'asc' ? 'ascending' : 'descending' }}</v-icon>
                    Name
                  </v-btn>
                  <v-btn value="date" @click="toggleSort('date')">
                    <v-icon>mdi-sort-clock-{{ sortOrder === 'asc' ? 'ascending' : 'descending' }}-outline</v-icon>
                    Date
                  </v-btn>
                </v-btn-toggle>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />

        <v-row v-if="filteredEntities.length === 0 && !loading">
          <v-col cols="12">
            <v-card class="text-center pa-8" variant="outlined">
              <v-icon size="64" color="grey-lighten-1" class="mb-4">
                {{ searchQuery ? 'mdi-magnify' : 'mdi-database-off' }}
              </v-icon>
              <h3 class="text-h5 mb-2">
                {{ searchQuery ? 'No results found' : 'No entities yet' }}
              </h3>
              <p class="text-body-1 text-grey mb-4">
                {{
                  searchQuery
                    ? 'Try adjusting your search query'
                    : 'Click the + button to add your first entity'
                }}
              </p>
              <v-btn v-if="!searchQuery" color="primary" size="large" @click="handleAddNew">
                <v-icon start>mdi-plus</v-icon>
                Add Entity
              </v-btn>
            </v-card>
          </v-col>
        </v-row>

        <v-list v-else lines="two" class="bg-transparent">
          <v-list-item
            v-for="entity in filteredEntities"
            :key="entity.modified.guid"
            @click="handleEntityClick(entity.modified.guid)"
            class="mb-2"
          >
            <template #prepend>
              <v-avatar color="primary">
                <v-icon>mdi-file-document</v-icon>
              </v-avatar>
            </template>

            <v-list-item-title class="font-weight-bold">
              {{ entity.modified.data.name || 'Unnamed' }}
            </v-list-item-title>

            <v-list-item-subtitle>
              {{ getEntitySubtitle(entity) }} •
              {{ new Date(entity.modified.lastUpdated).toLocaleDateString() }}
            </v-list-item-subtitle>

            <template #append>
              <v-icon>mdi-chevron-right</v-icon>
            </template>
          </v-list-item>
        </v-list>
      </v-container>
    </v-main>
  </v-app>
</template>

<style scoped>
.v-list-item {
  background: white;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.12);
}

.v-list-item:hover {
  background: #f5f5f5;
}
</style>
