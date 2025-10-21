<template>
  <Dialog :open="isOpen" @update:open="$emit('close')">
    <DialogContent class="max-w-6xl max-h-[80vh] overflow-hidden">
      <DialogHeader>
        <DialogTitle>Version Comparison</DialogTitle>
        <DialogDescription>
          Compare versions of {{ entityName }}
        </DialogDescription>
      </DialogHeader>

      <div class="grid grid-cols-2 gap-4 h-full">
        <!-- Version selector -->
        <div class="space-y-2">
          <Label>Select versions to compare:</Label>
          <div class="flex gap-2">
            <Select v-model="leftVersion">
              <SelectTrigger>
                <SelectValue placeholder="Select version" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="version in versions" :key="version.id" :value="version.id">
                  {{ version.label }} ({{ formatDate(version.timestamp) }})
                </SelectItem>
              </SelectContent>
            </Select>
            <Select v-model="rightVersion">
              <SelectTrigger>
                <SelectValue placeholder="Select version" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="version in versions" :key="version.id" :value="version.id">
                  {{ version.label }} ({{ formatDate(version.timestamp) }})
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <!-- Comparison view -->
        <div class="border rounded-lg overflow-hidden">
          <div class="border-b p-2 bg-muted">
            <div class="flex justify-between items-center">
              <span class="text-sm font-medium">Changes</span>
              <Badge variant="outline">{{ changes.length }} differences</Badge>
            </div>
          </div>

          <div class="p-4 space-y-2 max-h-96 overflow-y-auto">
            <div v-for="change in changes" :key="change.field" class="text-sm">
              <div class="flex items-center gap-2 mb-1">
                <Badge :variant="getChangeVariant(change.type)">
                  {{ change.type }}
                </Badge>
                <span class="font-medium">{{ change.field }}</span>
              </div>

              <div class="grid grid-cols-2 gap-2 text-xs">
                <div class="bg-red-50 dark:bg-red-950 p-2 rounded border-l-2 border-red-200 dark:border-red-800">
                  <div class="font-medium text-red-800 dark:text-red-200">Before:</div>
                  <div class="text-red-700 dark:text-red-300">{{ change.oldValue || '(empty)' }}</div>
                </div>
                <div class="bg-green-50 dark:bg-green-950 p-2 rounded border-l-2 border-green-200 dark:border-green-800">
                  <div class="font-medium text-green-800 dark:text-green-200">After:</div>
                  <div class="text-green-700 dark:text-green-300">{{ change.newValue || '(empty)' }}</div>
                </div>
              </div>
            </div>

            <div v-if="changes.length === 0" class="text-center text-muted-foreground py-8">
              No changes detected between selected versions
            </div>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="$emit('close')">
          Close
        </Button>
        <Button @click="exportComparison">
          Export Comparison
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import Dialog from '../ui/dialog'
import Button from '../ui/button'
import Label from '../ui/label'
import Badge from '../ui/badge'
import Select from '../ui/select'
import { ref, computed } from 'vue'

interface Version {
  id: string
  label: string
  timestamp: string | Date
  data: Record<string, any>
}

interface Change {
  field: string
  type: 'added' | 'removed' | 'modified'
  oldValue?: any
  newValue?: any
}

interface Props {
  isOpen: boolean
  versions: Version[]
  entityName: string
}

interface Emits {
  (e: 'close'): void
  (e: 'export'): void
}

defineProps<Props>()
defineEmits<Emits>()

const leftVersion = ref('')
const rightVersion = ref('')

const changes = computed(() => {
  if (!leftVersion.value || !rightVersion.value) return []

  const leftData = props.versions.find(v => v.id === leftVersion.value)?.data || {}
  const rightData = props.versions.find(v => v.id === rightVersion.value)?.data || {}

  const changes: Change[] = []
  const allFields = new Set([...Object.keys(leftData), ...Object.keys(rightData)])

  for (const field of allFields) {
    const oldValue = leftData[field]
    const newValue = rightData[field]

    if (oldValue === undefined) {
      changes.push({
        field,
        type: 'added',
        newValue
      })
    } else if (newValue === undefined) {
      changes.push({
        field,
        type: 'removed',
        oldValue
      })
    } else if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      changes.push({
        field,
        type: 'modified',
        oldValue,
        newValue
      })
    }
  }

  return changes
})

const getChangeVariant = (type: string) => {
  switch (type) {
    case 'added':
      return 'default'
    case 'removed':
      return 'destructive'
    case 'modified':
      return 'secondary'
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
    minute: '2-digit'
  })
}

const exportComparison = () => {
  // Export functionality would be implemented here
  // Could export as JSON, CSV, or PDF
}
</script>