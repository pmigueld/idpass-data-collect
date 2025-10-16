<template>
  <v-card class="tenant-app-card mb-4">
    <v-card-title class="d-flex align-center">
      <v-icon class="mr-2" color="primary">mdi-application</v-icon>
      {{ tenantApp.name }}
      <v-spacer />

      <v-menu>
        <template #activator="{ props }">
          <v-btn icon v-bind="props">
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item @click="$emit('view-details')">
            <v-list-item-title>
              <v-icon start>mdi-information</v-icon>
              View Details
            </v-list-item-title>
          </v-list-item>
          <v-list-item @click="$emit('edit')">
            <v-list-item-title>
              <v-icon start>mdi-pencil</v-icon>
              Edit
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-card-title>

    <v-card-text>
      <p class="text-body-1 mb-3">{{ tenantApp.description }}</p>

      <!-- Version Information -->
      <div class="d-flex align-center mb-3">
        <v-chip color="primary" variant="flat" class="mr-2">
          <v-icon start size="16">mdi-tag</v-icon>
          v{{ tenantApp.version }}
        </v-chip>

        <v-chip
          v-if="isLatestVersion"
          color="success"
          size="small"
        >
          Latest
        </v-chip>
        <v-chip
          v-else
          color="warning"
          size="small"
        >
          Update Available
        </v-chip>
      </div>

      <!-- Version Selection -->
      <div v-if="availableVersions.length > 1" class="mb-4">
        <v-select
          v-model="selectedVersion"
          :items="versionOptions"
          item-title="label"
          item-value="value"
          label="Select Version"
          variant="outlined"
          density="comfortable"
          @update:model-value="onVersionChange"
        />
      </div>

      <!-- App Metadata -->
      <div class="metadata-section">
        <div class="d-flex flex-wrap gap-2 mb-2">
          <v-chip size="small" variant="outlined">
            <v-icon start size="14">mdi-form-select</v-icon>
            {{ tenantApp.entityForms?.length || 0 }} Forms
          </v-chip>

          <v-chip size="small" variant="outlined">
            <v-icon start size="14">mdi-database</v-icon>
            {{ entityCount }} Entities
          </v-chip>

          <v-chip size="small" variant="outlined">
            <v-icon start size="14">mdi-sync</v-icon>
            {{ syncStatus }}
          </v-chip>
        </div>

        <!-- Version History -->
        <div v-if="showVersionHistory" class="version-history">
          <v-expansion-panels variant="accordion">
            <v-expansion-panel title="Version History">
              <v-expansion-panel-text>
                <v-timeline density="compact">
                  <v-timeline-item
                    v-for="version in versionHistory"
                    :key="version.version"
                    size="small"
                    :dot-color="version.isCurrent ? 'primary' : 'grey'"
                  >
                    <template #icon>
                      <v-icon size="16">
                        {{ version.isCurrent ? 'mdi-star' : 'mdi-circle' }}
                      </v-icon>
                    </template>

                    <div class="d-flex justify-space-between align-center">
                      <div>
                        <div class="text-body-2 font-weight-medium">
                          Version {{ version.version }}
                        </div>
                        <div class="text-caption text-medium-emphasis">
                          {{ version.date }}
                        </div>
                      </div>
                      <v-chip
                        v-if="version.isCurrent"
                        color="primary"
                        size="x-small"
                      >
                        Current
                      </v-chip>
                    </div>

                    <div class="text-caption mt-1">
                      {{ version.changes }}
                    </div>
                  </v-timeline-item>
                </v-timeline>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </div>
      </div>
    </v-card-text>

    <v-card-actions>
      <v-spacer />
      <v-btn
        color="primary"
        variant="flat"
        :disabled="!canAccess"
        @click="onAccess"
      >
        <v-icon start>mdi-login</v-icon>
        Access Application
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { TenantAppData } from '@/schemas/tenantApp.schema'

interface VersionInfo {
  version: string
  date: string
  changes: string
  isCurrent: boolean
}

interface Props {
  tenantApp: TenantAppData
  entityCount?: number
  syncStatus?: string
  availableVersions?: string[]
  versionHistory?: VersionInfo[]
  showVersionHistory?: boolean
  canAccess?: boolean
}

interface Emits {
  (e: 'access'): void
  (e: 'version-change', version: string): void
  (e: 'view-details'): void
  (e: 'edit'): void
}

const props = withDefaults(defineProps<Props>(), {
  entityCount: 0,
  syncStatus: 'Unknown',
  availableVersions: () => [],
  versionHistory: () => [],
  showVersionHistory: false,
  canAccess: true
})

const emit = defineEmits<Emits>()

const selectedVersion = ref(props.tenantApp.version)

const versionOptions = computed(() =>
  props.availableVersions.map(version => ({
    label: `Version ${version}`,
    value: version
  }))
)

const isLatestVersion = computed(() => {
  if (props.availableVersions.length === 0) return true
  const latest = Math.max(...props.availableVersions.map(v => parseFloat(v)))
  return parseFloat(props.tenantApp.version) >= latest
})

const onVersionChange = (version: string) => {
  selectedVersion.value = version
  emit('version-change', version)
}

const onAccess = () => {
  emit('access')
}
</script>

<style scoped>
.tenant-app-card {
  transition: all 0.2s ease;
}

.tenant-app-card:hover {
  transform: translateY(-2px);
}

.metadata-section {
  border-top: 1px solid rgba(0, 0, 0, 0.12);
  padding-top: 1rem;
}

.version-history {
  margin-top: 1rem;
}
</style>