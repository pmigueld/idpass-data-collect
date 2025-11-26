<template>
  <v-select
    :model-value="modelValue"
    :label="setting.label"
    :placeholder="setting.placeholder"
    :tooltip="setting.tooltip"
    :items="setting.options"
    variant="outlined"
    density="compact"
    class="mb-3"
    item-title="label"
    item-value="value"
    clearable
    @update:model-value="$emit('update:modelValue', $event)"
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