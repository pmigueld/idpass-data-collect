<template>
  <BaseComponent :schema="schema" @validation="handleValidation">
    <v-textarea
      :model-value="value"
      :label="schema.label"
      :placeholder="schema.placeholder"
      :description="schema.description"
      :required="schema.validate?.required"
      :disabled="disabled"
      :readonly="readonly"
      variant="outlined"
      density="comfortable"
      :rows="schema.rows || 3"
      :rules="fieldRules"
      @update:model-value="$emit('update:value', $event)"
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
  value?: string
  readonly?: boolean
  disabled?: boolean
}

interface Emits {
  (e: 'update:value', value: string): void
  (e: 'change', value: string): void
  (e: 'blur'): void
  (e: 'focus'): void
  (e: 'validation', errors: string[]): void
}

const props = withDefaults(defineProps<Props>(), {
  value: '',
  readonly: false,
  disabled: false,
})

const emit = defineEmits<Emits>()

const fieldRules = computed(() => {
  const rules: Array<(value: string) => boolean | string> = []

  if (props.schema.validate?.required) {
    rules.push((value: string) => !!value || `${props.schema.label} is required`)
  }

  if (props.schema.validate?.minLength) {
    rules.push((value: string) =>
      !value || value.length >= props.schema.validate!.minLength! ||
      `Minimum ${props.schema.validate!.minLength} characters required`
    )
  }

  if (props.schema.validate?.maxLength) {
    rules.push((value: string) =>
      !value || value.length <= props.schema.validate!.maxLength! ||
      `Maximum ${props.schema.validate!.maxLength} characters allowed`
    )
  }

  return rules
})

const handleValidation = (errors: string[]) => {
  emit('validation', errors)
}
</script>