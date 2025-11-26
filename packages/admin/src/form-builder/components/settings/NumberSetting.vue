<template>
  <v-text-field
    :model-value="modelValue"
    :label="setting.label"
    :placeholder="setting.placeholder"
    :tooltip="setting.tooltip"
    type="number"
    variant="outlined"
    density="compact"
    class="mb-3"
    :min="setting.min"
    :max="setting.max"
    @update:model-value="$emit('update:modelValue', Number($event))"
  />
</template>

<script setup lang="ts">
import type { ComponentSettingsDefinition } from '../../types/ComponentDefinition'

interface Props {
  modelValue: any
  setting: ComponentSettingsDefinition
}

defineProps<Props>()

defineEmits<{
  'update:modelValue': [value: any]
}>()
</script>