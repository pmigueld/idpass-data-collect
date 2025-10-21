<template>
  <div class="space-y-4">
    <!-- Search and filters -->
    <div class="flex items-center gap-2">
      <Input
        v-model="searchQuery"
        placeholder="Search entities..."
        class="max-w-sm"
      />
      <Select v-model="statusFilter">
        <SelectTrigger class="w-32">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="synced">Synced</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="conflict">Conflict</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <!-- Table -->
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Last Updated</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="entity in filteredEntities" :key="entity.id">
          <TableCell class="font-medium">{{ entity.name }}</TableCell>
          <TableCell>{{ entity.type }}</TableCell>
          <TableCell>
            <Badge :variant="getStatusVariant(entity.status)">
              {{ entity.status }}
            </Badge>
          </TableCell>
          <TableCell>{{ formatDate(entity.updatedAt) }}</TableCell>
          <TableCell>
            <div class="flex gap-1">
              <Button variant="outline" size="sm" @click="$emit('edit', entity)">
                Edit
              </Button>
              <Button variant="outline" size="sm" @click="$emit('view', entity)">
                View
              </Button>
              <Button variant="outline" size="sm" @click="$emit('delete', entity)">
                Delete
              </Button>
            </div>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>

    <!-- Pagination -->
    <div class="flex items-center justify-between">
      <div class="text-sm text-muted-foreground">
        Showing {{ startIndex + 1 }} to {{ Math.min(endIndex, filteredEntities.length) }} of {{ filteredEntities.length }} entities
      </div>
      <div class="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          :disabled="currentPage === totalPages"
          @click="currentPage++"
        >
          Next
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Table from '../ui/table'
import Button from '../ui/button'
import Input from '../ui/input'
import Badge from '../ui/badge'
import Select from '../ui/select'
import { ref, computed } from 'vue'
import type { Entity } from '../../types/entity'

interface Props {
  entities: Entity[]
  pageSize?: number
}

interface Emits {
  (e: 'edit', entity: Entity): void
  (e: 'view', entity: Entity): void
  (e: 'delete', entity: Entity): void
}

withDefaults(defineProps<Props>(), {
  pageSize: 10
})

defineEmits<Emits>()

const searchQuery = ref('')
const statusFilter = ref('all')
const currentPage = ref(1)

const filteredEntities = computed(() => {
  let filtered = props.entities

  // Filter by search query
  if (searchQuery.value) {
    filtered = filtered.filter((entity: Entity) =>
      entity.name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      entity.id.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  // Filter by status
  if (statusFilter.value !== 'all') {
    filtered = filtered.filter((entity: Entity) => entity.status === statusFilter.value)
  }

  return filtered
})

const totalPages = computed(() => Math.ceil(filteredEntities.value.length / props.pageSize))

const startIndex = computed(() => (currentPage.value - 1) * props.pageSize)
const endIndex = computed(() => startIndex.value + props.pageSize)

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'synced':
      return 'default'
    case 'pending':
      return 'secondary'
    case 'conflict':
      return 'destructive'
    case 'deleted':
      return 'outline'
    default:
      return 'default'
  }
}

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>