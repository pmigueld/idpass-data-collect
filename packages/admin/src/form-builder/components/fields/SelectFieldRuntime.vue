<template>
  <BaseComponent :schema="schema" @validation="handleValidation">
    <v-select
      :model-value="value"
      :label="schema.label"
      :placeholder="schema.placeholder"
      :hint="schema.description"
      :required="schema.validate?.required"
      :disabled="disabled"
      :readonly="readonly"
      :items="schema.data?.values || []"
      :multiple="schema.multiple"
      variant="outlined"
      density="comfortable"
      item-title="label"
      item-value="value"
      clearable
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
  value?: any
  readonly?: boolean
  disabled?: boolean
}

interface Emits {
  (e: 'update:value', value: any): void
  (e: 'change', value: any): void
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
  const rules: Array<(value: any) => boolean | string> = []

  if (props.schema.validate?.required) {
    const label = props.schema.label || 'This field'
    if (props.schema.multiple) {
      rules.push((value: any) =>
        Array.isArray(value) && value.length > 0 || `${label} is required`
      )
    } else {
      rules.push((value: any) => value !== null && value !== undefined && value !== '' || `${label} is required`)
    }
  }

  return rules
})

const handleValidation = (errors: string[]) => {
  emit('validation', errors)
}
</script>