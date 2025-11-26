<template>
  <div class="array-setting">
    <label class="v-label">{{ setting.label }}</label>

    <div v-if="!Array.isArray(localValue)" class="mb-3">
      <v-alert type="warning" density="compact">
        Value must be an array
      </v-alert>
    </div>

    <div v-else>
      <div
        v-for="(item, index) in localValue"
        :key="index"
        class="array-item mb-2"
      >
        <v-text-field
          :model-value="item"
          :placeholder="`Item ${index + 1}`"
          variant="outlined"
          density="compact"
          hide-details
          @update:model-value="updateItem(index, $event)"
        />
        <v-btn
          icon="mdi-delete"
          size="small"
          variant="text"
          color="error"
          @click="removeItem(index)"
        />
      </div>

      <v-btn
        variant="outlined"
        size="small"
        @click="addItem"
      >
        <v-icon left>mdi-plus</v-icon>
        Add Item
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { ComponentSettingsDefinition } from '../../types/ComponentDefinition'

interface Props {
  modelValue: any
  setting: ComponentSettingsDefinition
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: any]
}>()

const localValue = ref(Array.isArray(props.modelValue) ? [...props.modelValue] : [])

const updateItem = (index: number, value: any) => {
  localValue.value[index] = value
  emit('update:modelValue', [...localValue.value])
}

const addItem = () => {
  localValue.value.push('')
  emit('update:modelValue', [...localValue.value])
}

const removeItem = (index: number) => {
  localValue.value.splice(index, 1)
  emit('update:modelValue', [...localValue.value])
}

watch(() => props.modelValue, (newValue) => {
  localValue.value = Array.isArray(newValue) ? [...newValue] : []
})
</script>

<style scoped>
.array-setting {
  margin-bottom: 12px;
}

.array-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.array-item .v-text-field {
  flex: 1;
}
</style>