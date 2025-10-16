<script setup lang="ts">
import { useDatabase } from '@/database'
import { TenantAppData } from '@/schemas/tenantApp.schema'
import { store } from '@/store'
import { EntityForm } from '@/utils/dynamicFormIoUtils'
import { EntityDoc } from '@idpass/data-collect-core'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const database = useDatabase()

const tenantapp = ref<TenantAppData>()
const entityForm = ref<EntityForm>()
const entityData = ref<{ initial: EntityDoc; modified: EntityDoc }>()
const dependentForms = ref<EntityForm[]>([])
const events = ref<any[]>([])
const loading = ref(false)
const tab = ref('details')
const viewDataDialog = ref(false)

const formattedData = computed(() => {
  if (!entityData.value) return []
  const data = entityData.value.modified.data
  return Object.entries(data)
    .filter(([key]) => key !== 'parentGuid')
    .map(([key, value]) => ({
      key,
      value: typeof value === 'object' ? JSON.stringify(value, null, 2) : value
    }))
})

const eventTimeline = computed(() => {
  return events.value.map((event) => ({
    ...event,
    icon: getEventIcon(event.type),
    color: getEventColor(event.type),
    title: formatEventTitle(event.type),
    timestamp: new Date(event.timestamp).toLocaleString()
  }))
})

const getEventIcon = (type: string) => {
  const iconMap: Record<string, string> = {
    'create-group': 'mdi-plus-circle',
    'add-member': 'mdi-account-plus',
    'update-individual': 'mdi-pencil',
    'delete-entity': 'mdi-delete',
    default: 'mdi-circle-outline'
  }
  return iconMap[type] || iconMap.default
}

const getEventColor = (type: string) => {
  const colorMap: Record<string, string> = {
    'create-group': 'success',
    'add-member': 'info',
    'update-individual': 'warning',
    'delete-entity': 'error',
    default: 'grey'
  }
  return colorMap[type] || colorMap.default
}

const formatEventTitle = (type: string) => {
  return type
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

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

    const results = await store.searchEntities([{ guid: route.params.guid }])
    entityData.value = results[0]

    dependentForms.value = tenantapp.value.entityForms.filter(
      (entity) => entity.dependsOn === entityForm.value.name
    )

    // Fetch event history
    const allEvents = await store.getEventsSince('1970-01-01T00:00:00.000Z')
    const entityEvents = allEvents.filter(event => event.entityGuid === route.params.guid)
    events.value = entityEvents
  } finally {
    loading.value = false
  }
})

const onBack = () => {
  router.go(-1)
}

const handleEdit = () => {
  router.push(`${route.path.replace('/detail', '')}/edit`)
}

const handleNavigateToDependent = (formName: string) => {
  router.push(`${route.path}/${formName}`)
}
</script>

<template>
  <v-app>
    <v-app-bar color="primary" prominent>
      <v-btn icon @click="onBack">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-app-bar-title>Entity Details</v-app-bar-title>
      <v-btn icon @click="handleEdit">
        <v-icon>mdi-pencil</v-icon>
      </v-btn>
      <v-btn icon @click="viewDataDialog = true">
        <v-icon>mdi-code-json</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />

        <v-card v-if="entityData" class="mb-4" variant="tonal" color="primary">
          <v-card-text>
            <div class="d-flex justify-space-between align-center">
              <div>
                <div class="text-h5">{{ entityData.modified.data.name || 'Unnamed Entity' }}</div>
                <div class="text-caption">{{ entityForm?.title || entityForm?.name }}</div>
              </div>
              <v-chip color="white" variant="flat">
                <v-icon start>mdi-identifier</v-icon>
                {{ entityData.modified.guid.substring(0, 8) }}...
              </v-chip>
            </div>
          </v-card-text>
        </v-card>

        <v-tabs v-model="tab" color="primary" class="mb-4">
          <v-tab value="details">
            <v-icon start>mdi-information</v-icon>
            Details
          </v-tab>
          <v-tab value="history">
            <v-icon start>mdi-history</v-icon>
            Event History
            <v-badge :content="events.length" color="error" inline class="ml-2" />
          </v-tab>
          <v-tab v-if="dependentForms.length > 0" value="related">
            <v-icon start>mdi-link-variant</v-icon>
            Related Forms
          </v-tab>
        </v-tabs>

        <v-window v-model="tab">
          <v-window-item value="details">
            <v-card>
              <v-card-title>
                <v-icon class="mr-2">mdi-database</v-icon>
                Entity Data
              </v-card-title>
              <v-divider />
              <v-list>
                <v-list-item v-for="item in formattedData" :key="item.key">
                  <v-list-item-title class="font-weight-bold text-capitalize">
                    {{ item.key }}
                  </v-list-item-title>
                  <v-list-item-subtitle class="mt-1">
                    <pre v-if="typeof item.value === 'string' && item.value.startsWith('{')" class="text-body-2">{{ item.value }}</pre>
                    <span v-else>{{ item.value }}</span>
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>

              <v-divider />
              <v-card-text>
                <v-row>
                  <v-col cols="12" md="6">
                    <div class="text-caption text-grey">Created</div>
                    <div class="text-body-2">
                      {{ new Date(entityData.initial.lastUpdated).toLocaleString() }}
                    </div>
                  </v-col>
                  <v-col cols="12" md="6">
                    <div class="text-caption text-grey">Last Modified</div>
                    <div class="text-body-2">
                      {{ new Date(entityData.modified.lastUpdated).toLocaleString() }}
                    </div>
                  </v-col>
                  <v-col cols="12" md="6">
                    <div class="text-caption text-grey">Version</div>
                    <div class="text-body-2">{{ entityData.modified.version }}</div>
                  </v-col>
                  <v-col cols="12" md="6">
                    <div class="text-caption text-grey">GUID</div>
                    <div class="text-body-2 text-truncate">{{ entityData.modified.guid }}</div>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-window-item>

          <v-window-item value="history">
            <v-card>
              <v-card-title>
                <v-icon class="mr-2">mdi-timeline</v-icon>
                Event Timeline
              </v-card-title>
              <v-divider />

              <v-timeline v-if="eventTimeline.length > 0" side="end" class="pa-4">
                <v-timeline-item
                  v-for="(event, index) in eventTimeline"
                  :key="index"
                  :dot-color="event.color"
                  :icon="event.icon"
                  size="small"
                >
                  <template #opposite>
                    <div class="text-caption">{{ event.timestamp }}</div>
                  </template>

                  <v-card :color="event.color" variant="tonal">
                    <v-card-title class="text-subtitle-1">
                      {{ event.title }}
                    </v-card-title>
                    <v-card-subtitle>Type: {{ event.type }}</v-card-subtitle>
                    <v-card-text v-if="event.data">
                      <v-expansion-panels>
                        <v-expansion-panel>
                          <v-expansion-panel-title>View Event Data</v-expansion-panel-title>
                          <v-expansion-panel-text>
                            <pre class="text-caption">{{ JSON.stringify(event.data, null, 2) }}</pre>
                          </v-expansion-panel-text>
                        </v-expansion-panel>
                      </v-expansion-panels>
                    </v-card-text>
                  </v-card>
                </v-timeline-item>
              </v-timeline>

              <v-card-text v-else class="text-center py-8">
                <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-timeline-outline</v-icon>
                <div class="text-h6 text-grey">No events found</div>
              </v-card-text>
            </v-card>
          </v-window-item>

          <v-window-item value="related">
            <v-card>
              <v-card-title>
                <v-icon class="mr-2">mdi-file-tree</v-icon>
                Dependent Forms
              </v-card-title>
              <v-divider />
              <v-list>
                <v-list-item
                  v-for="form in dependentForms"
                  :key="form.name"
                  @click="handleNavigateToDependent(form.name)"
                >
                  <template #prepend>
                    <v-avatar color="secondary">
                      <v-icon>mdi-form-select</v-icon>
                    </v-avatar>
                  </template>

                  <v-list-item-title class="font-weight-bold">
                    {{ form.title }}
                  </v-list-item-title>

                  <v-list-item-subtitle> {{ form.name }} </v-list-item-subtitle>

                  <template #append>
                    <v-icon>mdi-chevron-right</v-icon>
                  </template>
                </v-list-item>
              </v-list>
            </v-card>
          </v-window-item>
        </v-window>
      </v-container>
    </v-main>

    <v-dialog v-model="viewDataDialog" max-width="800">
      <v-card>
        <v-card-title>
          <v-icon class="mr-2">mdi-code-json</v-icon>
          Raw Entity Data
        </v-card-title>
        <v-divider />
        <v-card-text>
          <v-tabs v-model="tab" color="primary">
            <v-tab value="modified">Modified</v-tab>
            <v-tab value="initial">Initial</v-tab>
          </v-tabs>
          <v-window v-model="tab" class="mt-4">
            <v-window-item value="modified">
              <pre class="pa-4 bg-grey-lighten-4 rounded" style="max-height: 60vh; overflow-y: auto">{{
                JSON.stringify(entityData?.modified, null, 2)
              }}</pre>
            </v-window-item>
            <v-window-item value="initial">
              <pre class="pa-4 bg-grey-lighten-4 rounded" style="max-height: 60vh; overflow-y: auto">{{
                JSON.stringify(entityData?.initial, null, 2)
              }}</pre>
            </v-window-item>
          </v-window>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="viewDataDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<style scoped>
pre {
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
