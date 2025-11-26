<template>
  <div class="preview-pane">
    <div class="preview-header">
      <h4 class="mb-0">Form Preview</h4>
      <v-btn
        variant="outlined"
        size="small"
        @click="submitForm"
        :disabled="!isFormValid"
      >
        <v-icon left>mdi-send</v-icon>
        Submit
      </v-btn>
    </div>

    <div class="preview-content">
      <v-form ref="formRef" @submit.prevent="handleSubmit">
        <div class="preview-form">
          <div
            v-for="(componentSchema, index) in schema.components"
            :key="componentSchema.key || index"
            class="preview-component"
          >
            <component
              :is="getRuntimeComponent(componentSchema.type)"
              :schema="componentSchema"
              :value="formData[componentSchema.key]"
              @update:value="updateField(componentSchema.key, $event)"
              @validation="handleValidation(componentSchema.key, $event)"
            />
          </div>
        </div>
      </v-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { componentRegistry } from '../utils/ComponentRegistry'
import type { FormSchema } from '../types/ComponentDefinition'

interface Props {
  schema: FormSchema
}

interface Emits {
  (e: 'submit', data: Record<string, any>): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const formRef = ref()
const formData = reactive<Record<string, any>>({})
const validationErrors = reactive<Record<string, string[]>>({})

// Initialize form data
const initializeFormData = () => {
  const data: Record<string, any> = {}
  props.schema.components.forEach(component => {
    data[component.key] = component.defaultValue || ''
  })
  Object.assign(formData, data)
}

const isFormValid = computed(() => {
  return Object.values(validationErrors).every(errors => errors.length === 0)
})

const getRuntimeComponent = (type: string) => {
  return componentRegistry.getRuntimeComponent(type) || 'div'
}

const updateField = (key: string, value: any) => {
  formData[key] = value
}

const handleValidation = (key: string, errors: string[]) => {
  validationErrors[key] = errors
}

const submitForm = async () => {
  if (!isFormValid.value) return

  try {
    await formRef.value?.validate()
    emit('submit', { ...formData })
  } catch (error) {
    console.error('Form validation failed:', error)
  }
}

const handleSubmit = () => {
  submitForm()
}

// Watch for schema changes to reinitialize form data
watch(() => props.schema, () => {
  initializeFormData()
  // Clear validation errors
  Object.keys(validationErrors).forEach(key => {
    validationErrors[key] = []
  })
}, { deep: true, immediate: true })
</script>

<style scoped>
.preview-pane {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: white;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  background-color: #f8f9fa;
}

.preview-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.preview-form {
  max-width: 600px;
  margin: 0 auto;
}

.preview-component {
  margin-bottom: 24px;
}

.preview-component:last-child {
  margin-bottom: 0;
}
</style>