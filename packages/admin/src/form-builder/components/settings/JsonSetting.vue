<template>
  <div class="json-setting">
    <label class="v-label">{{ setting.label }}</label>
    <v-textarea
      :model-value="jsonValue"
      :placeholder="setting.placeholder"
      :tooltip="setting.tooltip"
      variant="outlined"
      density="compact"
      class="mb-3 json-editor"
      rows="4"
      :class="{ 'error': hasJsonError }"
      @update:model-value="handleJsonInput"
    />
    <div v-if="hasJsonError" class="error-message text-error">
      Invalid JSON format
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { ComponentSettingsDefinition } from '../../types/ComponentDefinition'

interface Props {
  modelValue: any
  setting: ComponentSettingsDefinition
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: any]
}>()

const hasJsonError = ref(false)

const jsonValue = computed({
  get: () => {
    try {
      return JSON.stringify(props.modelValue, null, 2)
    } catch {
      return ''
    }
  },
  set: (value: string) => {
    try {
      const parsed = JSON.parse(value)
      hasJsonError.value = false
      emit('update:modelValue', parsed)
    } catch {
      hasJsonError.value = true
    }
  }
})

const handleJsonInput = (value: string) => {
  jsonValue.value = value
}
</script>

<style scoped>
.json-setting {
  margin-bottom: 12px;
}

.json-editor {
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

.error-message {
  font-size: 12px;
  margin-top: -8px;
  margin-bottom: 12px;
}
</style>