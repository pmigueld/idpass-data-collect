<template>
  <div class="flex items-center gap-2">
    <div class="flex items-center gap-2">
      <div
        class="w-2 h-2 rounded-full"
        :class="getStatusColor(syncStatus)"
      />
      <span class="text-sm font-medium">{{ getStatusText(syncStatus) }}</span>
    </div>

    <div v-if="lastSyncTime" class="text-xs text-muted-foreground">
      Last sync: {{ formatLastSyncTime(lastSyncTime) }}
    </div>

    <Button
      v-if="canSync"
      variant="outline"
      size="sm"
      @click="$emit('sync')"
      :disabled="isSyncing"
    >
      {{ isSyncing ? 'Syncing...' : 'Sync' }}
    </Button>
  </div>
</template>

<script setup lang="ts">
import Button from '../ui/button'

type SyncStatus = 'idle' | 'syncing' | 'success' | 'error' | 'offline'

interface Props {
  syncStatus: SyncStatus
  lastSyncTime?: Date
  isSyncing?: boolean
  canSync?: boolean
}

interface Emits {
  (e: 'sync'): void
}

withDefaults(defineProps<Props>(), {
  isSyncing: false,
  canSync: true
})

defineEmits<Emits>()

const getStatusColor = (status: SyncStatus) => {
  switch (status) {
    case 'idle':
      return 'bg-gray-400'
    case 'syncing':
      return 'bg-blue-500 animate-pulse'
    case 'success':
      return 'bg-green-500'
    case 'error':
      return 'bg-red-500'
    case 'offline':
      return 'bg-yellow-500'
    default:
      return 'bg-gray-400'
  }
}

const getStatusText = (status: SyncStatus) => {
  switch (status) {
    case 'idle':
      return 'Ready'
    case 'syncing':
      return 'Syncing...'
    case 'success':
      return 'Synced'
    case 'error':
      return 'Sync Error'
    case 'offline':
      return 'Offline'
    default:
      return 'Unknown'
  }
}

const formatLastSyncTime = (date: Date) => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  return `${days}d ago`
}
</script>