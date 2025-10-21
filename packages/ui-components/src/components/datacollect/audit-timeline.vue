<template>
  <Card class="w-full">
    <CardHeader>
      <CardTitle>Audit Timeline</CardTitle>
      <CardDescription>
        History of changes for {{ entityName }}
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div class="space-y-4">
        <div v-for="(event, index) in events" :key="event.id" class="flex gap-4">
          <!-- Timeline line -->
          <div class="flex flex-col items-center">
            <div class="w-3 h-3 bg-primary rounded-full" />
            <div v-if="index < events.length - 1" class="w-px bg-border h-8" />
          </div>

          <!-- Event content -->
          <div class="flex-1 pb-4">
            <div class="flex items-center justify-between mb-1">
              <Badge :variant="getEventVariant(event.type)">
                {{ event.type }}
              </Badge>
              <span class="text-xs text-muted-foreground">
                {{ formatDate(event.timestamp) }}
              </span>
            </div>

            <p class="text-sm text-muted-foreground mb-2">
              {{ event.description }}
            </p>

            <div v-if="event.user" class="text-xs text-muted-foreground">
              by {{ event.user }}
            </div>

            <!-- Event details (collapsible) -->
            <div v-if="event.details" class="mt-2">
              <Button
                variant="ghost"
                size="sm"
                @click="toggleDetails(index)"
                class="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
              >
                {{ showDetails[index] ? 'Hide' : 'Show' }} details
              </Button>

              <div v-if="showDetails[index]" class="mt-2 p-2 bg-muted rounded text-xs">
                <pre>{{ JSON.stringify(event.details, null, 2) }}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import Card from '../ui/card'
import Badge from '../ui/badge'
import Button from '../ui/button'
import { ref } from 'vue'

interface AuditEvent {
  id: string
  type: string
  timestamp: string | Date
  description: string
  user?: string
  details?: Record<string, any>
}

interface Props {
  events: AuditEvent[]
  entityName: string
}

defineProps<Props>()

const showDetails = ref<Record<number, boolean>>({})

const getEventVariant = (type: string) => {
  switch (type) {
    case 'create':
      return 'default'
    case 'update':
      return 'secondary'
    case 'delete':
      return 'destructive'
    case 'sync':
      return 'outline'
    default:
      return 'default'
  }
}

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const toggleDetails = (index: number) => {
  showDetails.value[index] = !showDetails.value[index]
}
</script>