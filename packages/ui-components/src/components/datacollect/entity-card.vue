<template>
  <Card class="w-full">
    <CardHeader class="pb-3">
      <div class="flex items-center justify-between">
        <CardTitle class="text-lg">{{ entity.name || entity.id }}</CardTitle>
        <Badge :variant="getStatusVariant(entity.status)">
          {{ entity.status }}
        </Badge>
      </div>
      <CardDescription>
        {{ entity.description }}
      </CardDescription>
    </CardHeader>
    <CardContent class="pt-0">
      <div class="grid gap-2">
        <div class="flex items-center justify-between text-sm">
          <span class="text-muted-foreground">Type:</span>
          <span>{{ entity.type }}</span>
        </div>
        <div class="flex items-center justify-between text-sm">
          <span class="text-muted-foreground">Last Updated:</span>
          <span>{{ formatDate(entity.updatedAt) }}</span>
        </div>
        <div class="flex items-center justify-between text-sm">
          <span class="text-muted-foreground">Version:</span>
          <span>{{ entity.version }}</span>
        </div>
      </div>
    </CardContent>
    <CardFooter class="pt-0">
      <div class="flex gap-2 w-full">
        <Button variant="outline" size="sm" class="flex-1">
          Edit
        </Button>
        <Button variant="outline" size="sm" class="flex-1">
          View History
        </Button>
      </div>
    </CardFooter>
  </Card>
</template>

<script setup lang="ts">
import Card from '../ui/card'
import Badge from '../ui/badge'
import Button from '../ui/button'
import type { Entity } from '../../types/entity'

interface Props {
  entity: Entity
}

defineProps<Props>()

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
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>