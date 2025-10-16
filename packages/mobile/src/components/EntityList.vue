<template>
  <div class="entity-list">
    <!-- List Header -->
    <div class="d-flex justify-space-between align-center mb-4">
      <div class="d-flex align-center">
        <v-icon class="mr-2" :color="color">{{ icon }}</v-icon>
        <h3 class="text-h6 mb-0">{{ title }}</h3>
      </div>

      <div class="d-flex gap-2">
        <v-chip size="small" variant="outlined">
          {{ entities.length }} items
        </v-chip>
        <v-btn
          v-if="showCreateButton"
          size="small"
          color="primary"
          prepend-icon="mdi-plus"
          @click="$emit('create')"
        >
          Add
        </v-btn>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <v-progress-circular indeterminate color="primary" />
      <div class="text-body-2 text-medium-emphasis mt-2">Loading...</div>
    </div>

    <!-- Empty State -->
    <div v-else-if="entities.length === 0" class="text-center py-8">
      <v-icon size="64" color="grey-lighten-2" class="mb-4">{{ emptyIcon }}</v-icon>
      <h4 class="text-h6 mb-2">{{ emptyTitle }}</h4>
      <p class="text-body-2 text-medium-emphasis mb-4">{{ emptyMessage }}</p>
      <v-btn
        v-if="showCreateButton"
        color="primary"
        prepend-icon="mdi-plus"
        @click="$emit('create')"
      >
        {{ createButtonText }}
      </v-btn>
    </div>

    <!-- Entity Items -->
    <div v-else class="entity-items">
      <v-card
        v-for="entity in entities"
        :key="entity.id"
        class="entity-item mb-2"
        variant="outlined"
        hover
        @click="$emit('select', entity)"
      >
        <v-card-text class="d-flex align-center py-3">
          <div class="d-flex align-center flex-grow-1">
            <v-avatar size="40" :color="getEntityColor(entity.status)" class="mr-3">
              <v-icon size="20" color="white">{{ getEntityIcon(entity.type) }}</v-icon>
            </v-avatar>

            <div class="flex-grow-1">
              <div class="d-flex align-center mb-1">
                <h6 class="text-body-1 mb-0 mr-2">{{ entity.name || `Entity ${entity.id}` }}</h6>
                <v-chip
                  size="x-small"
                  :color="getStatusColor(entity.status)"
                >
                  {{ entity.status }}
                </v-chip>
              </div>

              <div class="text-caption text-medium-emphasis">
                {{ entity.description || 'No description available' }}
              </div>

              <div class="d-flex gap-2 mt-1">
                <v-chip size="x-small" variant="outlined">
                  Created: {{ formatDate(entity.createdAt) }}
                </v-chip>
                <v-chip size="x-small" variant="outlined">
                  Version: {{ entity.version || '1.0' }}
                </v-chip>
              </div>
            </div>
          </div>

          <div class="d-flex align-center">
            <v-btn icon size="small" variant="text" @click.stop="$emit('menu', entity)">
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </div>

    <!-- Load More -->
    <div v-if="canLoadMore" class="text-center mt-4">
      <v-btn variant="outlined" :loading="loadingMore" @click="$emit('load-more')">
        Load More
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">

interface Entity {
  id: string
  name?: string
  description?: string
  type: string
  status: string
  version?: string
  createdAt: string
  [key: string]: any
}

interface Props {
  title?: string
  entities: Entity[]
  loading?: boolean
  loadingMore?: boolean
  canLoadMore?: boolean
  icon?: string
  color?: string
  emptyIcon?: string
  emptyTitle?: string
  emptyMessage?: string
  createButtonText?: string
  showCreateButton?: boolean
}

interface Emits {
  (e: 'create'): void
  (e: 'select', entity: Entity): void
  (e: 'menu', entity: Entity): void
  (e: 'load-more'): void
}

withDefaults(defineProps<Props>(), {
  title: 'Entities',
  loading: false,
  loadingMore: false,
  canLoadMore: false,
  icon: 'mdi-view-list',
  color: 'primary',
  emptyIcon: 'mdi-clipboard-text-off',
  emptyTitle: 'No entities found',
  emptyMessage: 'No entities are available at the moment.',
  createButtonText: 'Create New',
  showCreateButton: true
})

defineEmits<Emits>()

const getEntityColor = (status: string): string => {
  const colors: Record<string, string> = {
    'active': 'success',
    'inactive': 'error',
    'pending': 'warning',
    'draft': 'info'
  }
  return colors[status] || 'primary'
}

const getEntityIcon = (type: string): string => {
  const icons: Record<string, string> = {
    'individual': 'mdi-account',
    'household': 'mdi-home-group',
    'group': 'mdi-account-group',
    'beneficiary': 'mdi-hand-heart'
  }
  return icons[type.toLowerCase()] || 'mdi-file-document'
}

const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    'active': 'success',
    'inactive': 'error',
    'pending': 'warning',
    'draft': 'info'
  }
  return colors[status] || 'primary'
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString()
}
</script>

<style scoped>
.entity-list {
  min-height: 400px;
}

.entity-item {
  transition: all 0.2s ease;
  cursor: pointer;
}

.entity-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>