<template>
  <v-card class="event-history-card">
    <v-card-title class="d-flex align-center">
      <v-icon class="mr-2" color="primary">mdi-history</v-icon>
      Event History
      <v-spacer />

      <v-chip size="small" variant="outlined">
        {{ events.length }} Events
      </v-chip>
    </v-card-title>

    <v-card-text>
      <!-- Loading State -->
      <LoadingState v-if="loading" message="Loading event history..." />

      <!-- Error State -->
      <ErrorState
        v-else-if="error"
        :message="error"
        show-retry
        @retry="$emit('retry')"
      />

      <!-- Empty State -->
      <div v-else-if="events.length === 0" class="text-center pa-6">
        <v-icon size="64" color="grey-lighten-2" class="mb-4">mdi-clipboard-text-off</v-icon>
        <h3 class="text-h6 mb-2">No Events Found</h3>
        <p class="text-body-2 text-medium-emphasis">
          This entity doesn't have any recorded events yet.
        </p>
      </div>

      <!-- Events Timeline -->
      <v-timeline v-else density="compact" class="event-timeline">
        <v-timeline-item
          v-for="event in events"
          :key="event.id"
          size="small"
          :dot-color="getEventColor(event.type)"
        >
          <template #icon>
            <v-icon size="16">{{ getEventIcon(event.type) }}</v-icon>
          </template>

          <v-card variant="outlined" class="event-card">
            <v-card-text class="pa-3">
              <div class="d-flex justify-space-between align-center mb-2">
                <div class="d-flex align-center">
                  <v-chip
                    size="small"
                    :color="getEventColor(event.type)"
                    variant="flat"
                    class="mr-2"
                  >
                    {{ event.type }}
                  </v-chip>
                  <span class="text-caption text-medium-emphasis">
                    {{ formatTimestamp(event.timestamp) }}
                  </span>
                </div>

                <v-menu>
                  <template #activator="{ props }">
                    <v-btn icon size="small" v-bind="props">
                      <v-icon size="16">mdi-dots-vertical</v-icon>
                    </v-btn>
                  </template>
                  <v-list>
                    <v-list-item @click="$emit('view-event', event)">
                      <v-list-item-title>
                        <v-icon start size="14">mdi-eye</v-icon>
                        View Details
                      </v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="$emit('revert-event', event)">
                      <v-list-item-title>
                        <v-icon start size="14">mdi-undo</v-icon>
                        Revert Event
                      </v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </div>

              <div class="event-content">
                <div class="text-body-2 mb-2">
                  <strong>{{ event.user }}</strong> {{ getEventDescription(event) }}
                </div>

                <!-- Event Data Preview -->
                <div v-if="event.data && showDataPreview" class="event-data-preview">
                  <v-expansion-panels variant="accordion">
                    <v-expansion-panel>
                      <v-expansion-panel-title>
                        <span class="text-caption">Event Data</span>
                      </v-expansion-panel-title>
                      <v-expansion-panel-text>
                        <pre class="text-caption">{{ JSON.stringify(event.data, null, 2) }}</pre>
                      </v-expansion-panel-text>
                    </v-expansion-panel>
                  </v-expansion-panels>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-timeline-item>
      </v-timeline>

      <!-- Load More Button -->
      <div v-if="canLoadMore" class="text-center mt-4">
        <v-btn
          variant="outlined"
          :loading="loadingMore"
          @click="$emit('load-more')"
        >
          Load More Events
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import LoadingState from '@/components/LoadingState.vue'
import ErrorState from '@/components/ErrorState.vue'

interface EventData {
  id: string
  type: string
  timestamp: string
  user: string
  data?: any
}

interface Props {
  events: EventData[]
  loading?: boolean
  loadingMore?: boolean
  error?: string
  canLoadMore?: boolean
  showDataPreview?: boolean
}

interface Emits {
  (e: 'retry'): void
  (e: 'view-event', event: EventData): void
  (e: 'revert-event', event: EventData): void
  (e: 'load-more'): void
}

withDefaults(defineProps<Props>(), {
  events: () => [],
  loading: false,
  loadingMore: false,
  error: '',
  canLoadMore: false,
  showDataPreview: true
})

defineEmits<Emits>()

const getEventColor = (type: string): string => {
  const colors: Record<string, string> = {
    'create': 'success',
    'update': 'primary',
    'delete': 'error',
    'add-member': 'info',
    'remove-member': 'warning',
    'sync': 'secondary'
  }
  return colors[type.toLowerCase()] || 'grey'
}

const getEventIcon = (type: string): string => {
  const icons: Record<string, string> = {
    'create': 'mdi-plus',
    'update': 'mdi-pencil',
    'delete': 'mdi-delete',
    'add-member': 'mdi-account-plus',
    'remove-member': 'mdi-account-minus',
    'sync': 'mdi-sync'
  }
  return icons[type.toLowerCase()] || 'mdi-circle'
}

const getEventDescription = (event: EventData): string => {
  const descriptions: Record<string, string> = {
    'create': 'created this entity',
    'update': 'updated this entity',
    'delete': 'deleted this entity',
    'add-member': 'added a member',
    'remove-member': 'removed a member',
    'sync': 'synchronized data'
  }
  return descriptions[event.type.toLowerCase()] || 'performed an action'
}

const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp)
  return date.toLocaleString()
}
</script>

<style scoped>
.event-history-card {
  max-height: 600px;
  overflow-y: auto;
}

.event-timeline {
  max-height: 500px;
  overflow-y: auto;
}

.event-card {
  margin-left: 0.5rem;
}

.event-data-preview pre {
  background-color: #f5f5f5;
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  max-height: 200px;
  overflow-y: auto;
}
</style>