<template>
  <Dialog :open="isOpen" @update:open="$emit('close')">
    <DialogContent class="max-w-4xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Resolve Conflicts</DialogTitle>
        <DialogDescription>
          {{ conflicts.length }} conflicts need to be resolved
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-4">
        <div v-for="(conflict, index) in conflicts" :key="conflict.id" class="border rounded-lg p-4">
          <div class="flex items-center justify-between mb-3">
            <h4 class="font-medium">Conflict #{{ index + 1 }}</h4>
            <Badge variant="destructive">Conflict</Badge>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <!-- Local Version -->
            <div class="space-y-2">
              <h5 class="text-sm font-medium text-muted-foreground">Local Version</h5>
              <div class="bg-muted p-3 rounded text-sm">
                <div v-for="(value, key) in conflict.local" :key="key" class="flex justify-between">
                  <span>{{ key }}:</span>
                  <span>{{ value }}</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                @click="$emit('resolve', conflict.id, 'local')"
              >
                Use Local
              </Button>
            </div>

            <!-- Remote Version -->
            <div class="space-y-2">
              <h5 class="text-sm font-medium text-muted-foreground">Remote Version</h5>
              <div class="bg-muted p-3 rounded text-sm">
                <div v-for="(value, key) in conflict.remote" :key="key" class="flex justify-between">
                  <span>{{ key }}:</span>
                  <span>{{ value }}</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                @click="$emit('resolve', conflict.id, 'remote')"
              >
                Use Remote
              </Button>
            </div>
          </div>

          <!-- Merge Option -->
          <div class="mt-3 pt-3 border-t">
            <Button
              variant="default"
              size="sm"
              @click="$emit('resolve', conflict.id, 'merge')"
              class="w-full"
            >
              Merge Changes
            </Button>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="$emit('close')">
          Close
        </Button>
        <Button @click="$emit('resolveAll')">
          Resolve All Conflicts
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import Dialog from '../ui/dialog'
import Button from '../ui/button'
import Badge from '../ui/badge'

interface Conflict {
  id: string
  local: Record<string, any>
  remote: Record<string, any>
  entityId: string
  entityType: string
}

interface Props {
  isOpen: boolean
  conflicts: Conflict[]
}

interface Emits {
  (e: 'close'): void
  (e: 'resolve', conflictId: string, resolution: 'local' | 'remote' | 'merge'): void
  (e: 'resolveAll'): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>