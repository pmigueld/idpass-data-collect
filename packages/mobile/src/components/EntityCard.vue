<template>
  <v-card
    class="entity-card mb-3"
    :elevation="hover ? 4 : 2"
    hover
    @click="$emit('click')"
  >
    <v-card-text class="d-flex align-center">
      <div class="flex-grow-1">
        <div class="d-flex align-center mb-2">
          <v-icon :color="color" class="mr-2">{{ icon }}</v-icon>
          <h6 class="text-h6 mb-0">{{ title }}</h6>
          <v-spacer />
          <v-chip
            v-if="status"
            :color="getStatusColor(status)"
            size="small"
          >
            {{ status }}
          </v-chip>
        </div>

        <div class="text-body-2 text-medium-emphasis">
          <div v-if="subtitle" class="mb-1">{{ subtitle }}</div>
          <div v-if="description" class="mb-1">{{ description }}</div>
        </div>

        <div v-if="metadata" class="d-flex flex-wrap gap-2 mt-2">
          <v-chip
            v-for="(value, key) in metadata"
            :key="key"
            size="x-small"
            variant="outlined"
          >
            <strong>{{ key }}:</strong> {{ value }}
          </v-chip>
        </div>
      </div>

      <div class="ml-3">
        <v-btn icon variant="text" @click.stop="$emit('action')">
          <v-icon>{{ actionIcon }}</v-icon>
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
interface Props {
  title: string
  subtitle?: string
  description?: string
  icon?: string
  color?: string
  status?: string
  metadata?: Record<string, string>
  actionIcon?: string
  hover?: boolean
}

interface Emits {
  (e: 'click'): void
  (e: 'action'): void
}

withDefaults(defineProps<Props>(), {
  icon: 'mdi-file-document-outline',
  color: 'primary',
  actionIcon: 'mdi-chevron-right',
  hover: true
})

defineEmits<Emits>()

const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    'active': 'success',
    'inactive': 'error',
    'pending': 'warning',
    'draft': 'info',
    'synced': 'success',
    'unsynced': 'warning',
    'offline': 'grey'
  }
  return statusColors[status.toLowerCase()] || 'primary'
}
</script>

<style scoped>
.entity-card {
  transition: all 0.2s ease;
}

.entity-card:hover {
  transform: translateY(-2px);
}
</style>