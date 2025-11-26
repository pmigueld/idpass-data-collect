<template>
  <v-checkbox
    :model-value="modelValue"
    :label="setting.label"
    :tooltip="setting.tooltip"
    density="compact"
    class="mb-2"
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