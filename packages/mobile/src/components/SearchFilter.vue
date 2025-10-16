<template>
  <v-card class="mb-4" elevation="0" outlined>
    <v-card-text>
      <v-row>
        <!-- Search Field -->
        <v-col cols="12" md="6">
          <v-text-field
            v-model="searchQuery"
            :placeholder="searchPlaceholder"
            prepend-inner-icon="mdi-magnify"
            clearable
            density="comfortable"
            @input="onSearch"
          />
        </v-col>

        <!-- Filter Dropdown -->
        <v-col cols="12" md="3">
          <v-select
            v-model="selectedFilter"
            :items="filterOptions"
            item-title="label"
            item-value="value"
            label="Filter by"
            density="comfortable"
            @update:model-value="onFilter"
          />
        </v-col>

        <!-- Sort Options -->
        <v-col cols="12" md="3">
          <v-select
            v-model="selectedSort"
            :items="sortOptions"
            item-title="label"
            item-value="value"
            label="Sort by"
            density="comfortable"
            @update:model-value="onSort"
          />
        </v-col>
      </v-row>

      <!-- Active Filters Display -->
      <v-row v-if="activeFilters.length > 0">
        <v-col cols="12">
          <div class="d-flex flex-wrap gap-2">
            <span class="text-caption text-medium-emphasis">Active filters:</span>
            <v-chip
              v-for="filter in activeFilters"
              :key="filter.key"
              size="small"
              closable
              @click:close="removeFilter(filter.key)"
            >
              {{ filter.label }}
            </v-chip>
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface FilterOption {
  label: string
  value: string
}

interface SortOption {
  label: string
  value: string
}

interface Props {
  searchPlaceholder?: string
  filterOptions?: FilterOption[]
  sortOptions?: SortOption[]
  debounceMs?: number
}

interface Emits {
  (e: 'search', value: string): void
  (e: 'filter', value: string): void
  (e: 'sort', value: string): void
  (e: 'filter-removed', key: string): void
}

const props = withDefaults(defineProps<Props>(), {
  searchPlaceholder: 'Search...',
  filterOptions: () => [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Pending', value: 'pending' }
  ],
  sortOptions: () => [
    { label: 'Name (A-Z)', value: 'name-asc' },
    { label: 'Name (Z-A)', value: 'name-desc' },
    { label: 'Date (Newest)', value: 'date-desc' },
    { label: 'Date (Oldest)', value: 'date-asc' }
  ],
  debounceMs: 300
})

const emit = defineEmits<Emits>()

const searchQuery = ref('')
const selectedFilter = ref('all')
const selectedSort = ref('name-asc')

let searchTimeout: NodeJS.Timeout | null = null

const activeFilters = computed(() => {
  const filters = []

  if (searchQuery.value.trim()) {
    filters.push({ key: 'search', label: `Search: "${searchQuery.value}"` })
  }

  if (selectedFilter.value !== 'all') {
    const filterOption = props.filterOptions.find(f => f.value === selectedFilter.value)
    if (filterOption) {
      filters.push({ key: 'filter', label: `Filter: ${filterOption.label}` })
    }
  }

  if (selectedSort.value !== 'name-asc') {
    const sortOption = props.sortOptions.find(s => s.value === selectedSort.value)
    if (sortOption) {
      filters.push({ key: 'sort', label: `Sort: ${sortOption.label}` })
    }
  }

  return filters
})

const onSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  searchTimeout = setTimeout(() => {
    emit('search', searchQuery.value)
  }, props.debounceMs)
}

const onFilter = (value: string) => {
  emit('filter', value)
}

const onSort = (value: string) => {
  emit('sort', value)
}

const removeFilter = (key: string) => {
  if (key === 'search') {
    searchQuery.value = ''
    onSearch()
  } else if (key === 'filter') {
    selectedFilter.value = 'all'
    onFilter('all')
  } else if (key === 'sort') {
    selectedSort.value = 'name-asc'
    onSort('name-asc')
  }
}

// Watch for external changes
watch(() => props.filterOptions, () => {
  if (!props.filterOptions.some(f => f.value === selectedFilter.value)) {
    selectedFilter.value = 'all'
  }
})

watch(() => props.sortOptions, () => {
  if (!props.sortOptions.some(s => s.value === selectedSort.value)) {
    selectedSort.value = 'name-asc'
  }
})
</script>