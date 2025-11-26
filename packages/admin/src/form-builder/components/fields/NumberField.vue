<template>
  <BaseComponent :schema="schema" @validation="handleValidation">
    <v-text-field
      :model-value="value"
      :label="schema.label"
      :placeholder="schema.placeholder"
      :description="schema.description"
      :required="schema.validate?.required"
      :disabled="disabled"
      :readonly="readonly"
      type="number"
      variant="outlined"
      density="comfortable"
      :min="schema.validate?.min"
      :max="schema.validate?.max"
      :step="schema.step || 1"
      :rules="fieldRules"
      @update:model-value="handleInput"
      @blur="$emit('blur')"
      @focus="$emit('focus')"
    />
  </BaseComponent>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseComponent from '../BaseComponent.vue'
import type { ComponentSchema } from '../../types/ComponentDefinition'

interface Props {
  schema: ComponentSchema
  value?: number | null
  readonly?: boolean
  disabled?: boolean
}

interface Emits {
  (e: 'update:value', value: number | null): void
  (e: 'change', value: number | null): void
  (e: 'blur'): void
  (e: 'focus'): void
  (e: 'validation', errors: string[]): void
}

const props = withDefaults(defineProps<Props>(), {
  value: null,
  readonly: false,
  disabled: false,
})

const emit = defineEmits<Emits>()

const fieldRules = computed(() => {
  const rules: Array<(value: number | null) => boolean | string> = []

  if (props.schema.validate?.required) {
    rules.push((value: number | null) => value !== null && value !== undefined || `${props.schema.label} is required`)
  }

  if (props.schema.validate?.min !== undefined) {
    rules.push((value: number | null) =>
      value === null || value === undefined || value >= props.schema.validate!.min! ||
      `Minimum value is ${props.schema.validate!.min}`
    )
  }

  if (props.schema.validate?.max !== undefined) {
    rules.push((value: number | null) =>
      value === null || value === undefined || value <= props.schema.validate!.max! ||
      `Maximum value is ${props.schema.validate!.max}`
    )
  }

  return rules
})

const handleInput = (eventValue: string) => {
  const numValue = eventValue === '' ? null : Number(eventValue)
  emit('update:value', numValue)
  emit('change', numValue)
}

const handleValidation = (errors: string[]) => {
  emit('validation', errors)
}
</script>