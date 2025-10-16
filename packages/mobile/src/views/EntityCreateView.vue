<template>
  <AppLayout
    :title="`Create ${currentEntityType}`"
    :sync-status="syncStatus"
    :navigation-items="navigationItems"
    @logout="handleLogout"
    @sync="handleSync"
  >
    <div class="entity-create-view">
      <!-- Form Header -->
      <v-card class="mb-6" elevation="2">
        <v-card-text class="pa-6">
          <div class="d-flex align-center">
            <v-avatar size="48" color="primary" class="mr-4">
              <v-icon size="24" color="white">{{ entityIcon }}</v-icon>
            </v-avatar>

            <div class="flex-grow-1">
              <h1 class="text-h5 mb-1">Create New {{ currentEntityType }}</h1>
              <p class="text-body-2 text-medium-emphasis">
                Fill in the form below to create a new {{ currentEntityType.toLowerCase() }} entity.
              </p>
            </div>

            <div class="d-flex gap-2">
              <v-chip color="primary" size="small">
                New Entity
              </v-chip>
              <v-chip size="small" variant="outlined">
                Version 1.0
              </v-chip>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <!-- Create Form -->
      <EntityForm
        :title="`Create ${currentEntityType}`"
        :icon="entityIcon"
        :color="entityColor"
        :saving="saving"
        submit-text="Create Entity"
        @submit="createEntity"
        @cancel="goBack"
        @close="goBack"
      />

      <!-- Creation Guidelines -->
      <v-card class="mt-6" variant="outlined">
        <v-card-title class="text-h6">
          <v-icon class="mr-2">mdi-information</v-icon>
          Creation Guidelines
        </v-card-title>
        <v-card-text>
          <v-alert type="info" variant="tonal" class="mb-4">
            Please ensure all required fields are filled out correctly. The entity will be created with version 1.0.
          </v-alert>

          <div class="d-flex flex-column gap-2">
            <div class="d-flex align-center">
              <v-icon size="16" color="success" class="mr-2">mdi-check-circle</v-icon>
              <span class="text-body-2">All data will be validated before creation</span>
            </div>
            <div class="d-flex align-center">
              <v-icon size="16" color="success" class="mr-2">mdi-check-circle</v-icon>
              <span class="text-body-2">Entity will be automatically synced when online</span>
            </div>
            <div class="d-flex align-center">
              <v-icon size="16" color="success" class="mr-2">mdi-check-circle</v-icon>
              <span class="text-body-2">Creation event will be recorded in the audit trail</span>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import EntityForm from '@/components/EntityForm.vue'

const route = useRoute()
const router = useRouter()

const saving = ref(false)

const currentEntityType = computed(() =>
  (route.params.entity as string) || 'Entity'
)

const entityColor = computed(() => 'primary')

const entityIcon = computed(() => {
  const icons: Record<string, string> = {
    'Individual': 'mdi-account',
    'Household': 'mdi-home-group',
    'Group': 'mdi-account-group',
    'Beneficiary': 'mdi-hand-heart'
  }
  return icons[currentEntityType.value] || 'mdi-file-document'
})

const syncStatus = computed(() => 'offline' as const)

const navigationItems = [
  { title: 'Back to List', icon: 'mdi-arrow-left', to: `/app/${route.params.id}/${route.params.entity}` }
]

const createEntity = async (data: any) => {
  try {
    saving.value = true

    // Mock entity creation
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Generate new entity ID
    const entityId = `entity-${Date.now()}`

    // Create entity object
    const newEntity = {
      id: entityId,
      name: data.name || `New ${currentEntityType.value}`,
      type: currentEntityType.value.toLowerCase(),
      status: 'active',
      version: '1.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      synced: false,
      data: { ...data }
    }

    console.log('Created new entity:', newEntity)

    // Navigate to entity detail view
    router.push(`/app/${route.params.id}/${route.params.entity}/${entityId}/detail`)
  } catch (error) {
    console.error('Failed to create entity:', error)
    // Error handling would be implemented here
  } finally {
    saving.value = false
  }
}

const goBack = () => {
  router.back()
}

const handleLogout = async () => {
  // Implement logout logic
  router.push('/')
}

const handleSync = async () => {
  // Implement sync logic
  console.log('Syncing...')
}
</script>

<style scoped>
.entity-create-view {
  max-width: 800px;
  margin: 0 auto;
}
</style>