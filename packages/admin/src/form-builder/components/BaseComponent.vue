<template>
  <div
    :class="componentClasses"
    :data-component-type="schema.type"
    :data-component-key="schema.key"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, inject, provide, ref, watch } from 'vue'
import type { ComponentSchema } from '../types/ComponentDefinition'

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
  value: undefined,
  readonly: false,
  disabled: false,
})

const emit = defineEmits<Emits>()

// Internal state
const internalValue = ref(props.value)
const isValid = ref(true)
const validationErrors = ref<string[]>([])
const isFocused = ref(false)

// Computed properties
const componentClasses = computed(() => {
  return {
    'form-component': true,
    'component-invalid': !isValid.value,
    'component-focused': isFocused.value,
    'component-disabled': props.disabled,
    'component-readonly': props.readonly,
    [`component-${props.schema.type}`]: true,
  }
})

// Validation
const validate = (value?: any): string[] => {
  const errors: string[] = []
  const val = value !== undefined ? value : internalValue.value

  if (props.schema.validate?.required && (val === null || val === undefined || val === '')) {
    errors.push(`${props.schema.label || 'This field'} is required`)
  }

  if (val && typeof val === 'string') {
    if (props.schema.validate?.minLength && val.length < props.schema.validate.minLength) {
      errors.push(`Minimum length is ${props.schema.validate.minLength} characters`)
    }
    if (props.schema.validate?.maxLength && val.length > props.schema.validate.maxLength) {
      errors.push(`Maximum length is ${props.schema.validate.maxLength} characters`)
    }
    if (props.schema.validate?.pattern && !new RegExp(props.schema.validate.pattern).test(val)) {
      errors.push('Invalid format')
    }
  }

  return errors
}

// Event handlers
const handleInput = (value: any) => {
  internalValue.value = value
  emit('update:value', value)
  emit('change', value)

  // Validate on change
  const errors = validate(value)
  validationErrors.value = errors
  isValid.value = errors.length === 0
  emit('validation', errors)
}

const handleFocus = () => {
  isFocused.value = true
  emit('focus')
}

const handleBlur = () => {
  isFocused.value = false
  emit('blur')

  // Validate on blur
  const errors = validate(internalValue.value)
  validationErrors.value = errors
  isValid.value = errors.length === 0
  emit('validation', errors)
}

// Watch for external value changes
watch(() => props.value, (newValue) => {
  internalValue.value = newValue
  const errors = validate(newValue)
  validationErrors.value = errors
  isValid.value = errors.length === 0
})

// Watch for schema changes
watch(() => props.schema, () => {
  const errors = validate(internalValue.value)
  validationErrors.value = errors
  isValid.value = errors.length === 0
}, { deep: true })

// Provide context for child components
provide('component-context', {
  schema: props.schema,
  value: internalValue,
  readonly: props.readonly,
  disabled: props.disabled,
  isValid,
  validationErrors,
  handleInput,
  handleFocus,
  handleBlur,
})

// Expose public methods
defineExpose({
  validate,
  isValid: () => isValid.value,
  getErrors: () => validationErrors.value,
  getValue: () => internalValue.value,
  setValue: (value: any) => handleInput(value),
})
</script>

<style scoped>
.form-component {
  position: relative;
}

.component-invalid {
  border-color: #dc3545 !important;
}

.component-focused {
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.component-disabled {
  opacity: 0.6;
  pointer-events: none;
}

.component-readonly {
  background-color: #f8f9fa;
}
</style>