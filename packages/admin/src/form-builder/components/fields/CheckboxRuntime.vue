<template>
  <BaseComponent :schema="schema" @validation="handleValidation">
    <v-checkbox
      :model-value="value"
      :label="schema.label"
      :hint="schema.description"
      :required="schema.validate?.required"
      :disabled="disabled"
      :readonly="readonly"
      variant="outlined"
      density="comfortable"
      persistent-hint
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
  value?: boolean
  readonly?: boolean
  disabled?: boolean
}

interface Emits {
  (e: 'update:value', value: boolean | null): void
  (e: 'change', value: boolean | null): void
  (e: 'blur'): void
  (e: 'focus'): void
  (e: 'validation', errors: string[]): void
}

const props = withDefaults(defineProps<Props>(), {
  value: false,
  readonly: false,
  disabled: false,
})

const emit = defineEmits<Emits>()

const fieldRules = computed(() => {
  const rules: Array<(value: boolean) => boolean | string> = []

  if (props.schema.validate?.required) {
    rules.push((value: boolean) => value === true || `${props.schema.label} is required`)
  }

  return rules
})

const handleValidation = (errors: string[]) => {
  emit('validation', errors)
}

const handleInput = (value: boolean) => {
  emit('update:value', value)
  emit('change', value)
}
</script>