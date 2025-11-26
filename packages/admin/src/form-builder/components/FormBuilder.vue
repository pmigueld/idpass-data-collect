<template>
  <div class="form-builder">
    <div class="form-builder-header">
      <h3 class="mb-0">Form Builder</h3>
      <div class="form-builder-actions">
        <v-btn
          variant="outlined"
          size="small"
          @click="togglePreview"
        >
          <v-icon left>{{ isPreviewMode ? 'mdi-pencil' : 'mdi-eye' }}</v-icon>
          {{ isPreviewMode ? 'Edit' : 'Preview' }}
        </v-btn>
        <v-btn
          variant="outlined"
          size="small"
          @click="clearForm"
        >
          <v-icon left>mdi-refresh</v-icon>
          Clear
        </v-btn>
        <v-btn
          variant="outlined"
          size="small"
          @click="exportSchema"
        >
          <v-icon left>mdi-download</v-icon>
          Export
        </v-btn>
      </div>
    </div>

    <div class="form-builder-content">
      <!-- Component Palette -->
      <div class="form-builder-palette" v-if="!isPreviewMode">
        <ComponentPalette
          @component-selected="handleComponentDefinitionSelected"
        />
      </div>

      <!-- Main Canvas Area -->
      <div class="form-builder-canvas">
        <FormCanvas
          v-if="!isPreviewMode"
          :schema="schema"
          :selected-component="selectedComponent"
          @component-added="handleComponentAdded"
          @component-selected="handleComponentSelected"
          @component-updated="handleComponentUpdated"
          @component-deleted="handleComponentDeleted"
        />

        <PreviewPane
          v-else
          :schema="schema"
          @submit="handleFormSubmit"
        />
      </div>

      <!-- Component Settings -->
      <div class="form-builder-settings" v-if="!isPreviewMode && selectedComponent">
        <ComponentSettings
          :component="selectedComponent"
          @update="handleComponentSettingsUpdate"
          @delete="handleComponentDelete"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, provide, watch } from 'vue'
import ComponentPalette from './ComponentPalette.vue'
import FormCanvas from './FormCanvas.vue'
import ComponentSettings from './ComponentSettings.vue'
import PreviewPane from './PreviewPane.vue'
import { componentRegistry } from '../utils/ComponentRegistry'
import type { FormSchema, ComponentInstance, ComponentDefinition, ComponentSchema } from '../types/ComponentDefinition'

interface Props {
  modelValue: FormSchema
}

interface Emits {
  (e: 'update:modelValue', schema: FormSchema): void
  (e: 'change', schema: FormSchema): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// State
const schema = reactive<FormSchema>({ ...props.modelValue })
const selectedComponent = ref<ComponentInstance | null>(null)
const draggedComponent = ref<ComponentDefinition | null>(null)
const isPreviewMode = ref(false)

// Provide state to child components
provide('form-builder-state', {
  schema,
  selectedComponent,
  draggedComponent,
  isPreviewMode,
})

// Event handlers
const handleComponentSelected = (component: ComponentInstance | null) => {
  selectedComponent.value = component
}

const handleComponentDefinitionSelected = (componentDef: ComponentDefinition) => {
  // Create a new component instance from the definition
  const key = generateUniqueKey(componentDef.type)
  const newSchema: ComponentSchema = {
    ...componentRegistry.createSchema(componentDef.type),
    key,
    label: componentDef.label,
  }

  const component: ComponentInstance = {
    id: generateId(),
    type: componentDef.type,
    schema: newSchema,
  }

  // Add the component to the schema
  schema.components.push(newSchema)
  selectedComponent.value = component
  emitChange()
}

const handleComponentAdded = (component: ComponentInstance) => {
  schema.components.push(component.schema)
  selectedComponent.value = component
  emitChange()
}

const handleComponentUpdated = (component: ComponentInstance) => {
  const index = schema.components.findIndex(c => c.key === component.schema.key)
  if (index > -1) {
    schema.components[index] = { ...component.schema }
    emitChange()
  }
}

const handleComponentDeleted = (component: ComponentInstance) => {
  const index = schema.components.findIndex(c => c.key === component.schema.key)
  if (index > -1) {
    schema.components.splice(index, 1)
    if (selectedComponent.value?.schema.key === component.schema.key) {
      selectedComponent.value = null
    }
    emitChange()
  }
}

const handleComponentSettingsUpdate = (updatedComponent: ComponentInstance) => {
  handleComponentUpdated(updatedComponent)
}

const handleComponentDelete = () => {
  if (selectedComponent.value) {
    handleComponentDeleted(selectedComponent.value)
  }
}

const handleFormSubmit = (data: Record<string, any>) => {
  console.log('Form submitted:', data)
  // Handle form submission in preview mode
}

const togglePreview = () => {
  isPreviewMode.value = !isPreviewMode.value
  if (isPreviewMode.value) {
    selectedComponent.value = null
  }
}

const clearForm = () => {
  schema.components = []
  selectedComponent.value = null
  emitChange()
}

const exportSchema = () => {
  const dataStr = JSON.stringify(schema, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'form-schema.json'
  link.click()
  URL.revokeObjectURL(url)
}

const generateId = (): string => {
  return `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

const generateUniqueKey = (type: string): string => {
  let counter = 1
  let key = `${type}${counter}`

  while (schema.components.some(comp => comp.key === key)) {
    counter++
    key = `${type}${counter}`
  }

  return key
}

const emitChange = () => {
  emit('update:modelValue', { ...schema })
  emit('change', { ...schema })
}

// Watch for external schema changes
watch(() => props.modelValue, (newSchema) => {
  Object.assign(schema, newSchema)
}, { deep: true })
</script>

<style scoped>
.form-builder {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f5f5f5;
}

.form-builder-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: white;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-builder-actions {
  display: flex;
  gap: 8px;
}

.form-builder-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.form-builder-palette {
  width: 250px;
  background-color: white;
  border-right: 1px solid #e0e0e0;
  overflow-y: auto;
}

.form-builder-canvas {
  flex: 1;
  overflow: hidden;
  background-color: #fafafa;
}

.form-builder-settings {
  width: 300px;
  background-color: white;
  border-left: 1px solid #e0e0e0;
  overflow-y: auto;
}
</style>