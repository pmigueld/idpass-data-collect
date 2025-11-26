<template>
  <div class="form-canvas">
    <div class="canvas-header">
      <div class="canvas-title">
        <v-icon left>mdi-view-list</v-icon>
        Form Canvas
      </div>
      <div class="canvas-info">
        {{ schema.components.length }} component{{ schema.components.length !== 1 ? 's' : '' }}
      </div>
    </div>

    <div
      class="canvas-drop-zone"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
      :class="{ 'drop-active': isDragOver }"
    >
      <div class="canvas-content">
        <div
          v-if="schema.components.length === 0"
          class="empty-canvas"
        >
          <v-icon size="64" color="grey-lighten-1">mdi-plus-circle-outline</v-icon>
          <p class="text-h6 text-grey-lighten-1 mt-4">Start building your form</p>
          <p class="text-body-2 text-grey-lighten-2">
            Drag components from the palette or click to add them
          </p>
        </div>

        <div
          v-for="(componentSchema, index) in schema.components"
          :key="componentSchema.key || index"
          class="canvas-component-wrapper"
          :class="{ 'selected': isSelected(componentSchema) }"
          @click="selectComponent(componentSchema, index)"
        >
          <div class="component-toolbar" v-if="isSelected(componentSchema)">
            <v-btn
              size="small"
              variant="text"
              color="primary"
              @click.stop="moveComponent(index, -1)"
              :disabled="index === 0"
            >
              <v-icon>mdi-chevron-up</v-icon>
            </v-btn>
            <v-btn
              size="small"
              variant="text"
              color="primary"
              @click.stop="moveComponent(index, 1)"
              :disabled="index === schema.components.length - 1"
            >
              <v-icon>mdi-chevron-down</v-icon>
            </v-btn>
            <v-spacer />
            <v-btn
              size="small"
              variant="text"
              color="error"
              @click.stop="deleteComponent(componentSchema)"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </div>

          <component
            :is="getBuilderComponent(componentSchema.type)"
            :schema="componentSchema"
            :value="componentSchema.defaultValue"
            readonly
            class="canvas-component"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject } from 'vue'
import { componentRegistry } from '../utils/ComponentRegistry'
import type { FormSchema, ComponentSchema, ComponentInstance } from '../types/ComponentDefinition'

interface Props {
  schema: FormSchema
  selectedComponent: ComponentInstance | null
}

interface Emits {
  (e: 'component-added', component: ComponentInstance): void
  (e: 'component-selected', component: ComponentInstance | null): void
  (e: 'component-updated', component: ComponentInstance): void
  (e: 'component-deleted', component: ComponentInstance): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isDragOver = ref(false)

const isSelected = (componentSchema: ComponentSchema): boolean => {
  return props.selectedComponent?.schema.key === componentSchema.key
}

const selectComponent = (componentSchema: ComponentSchema, index: number) => {
  const component: ComponentInstance = {
    id: generateId(),
    type: componentSchema.type,
    schema: componentSchema,
  }
  emit('component-selected', component)
}

const getBuilderComponent = (type: string) => {
  return componentRegistry.getBuilderComponent(type) || 'div'
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = false
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = false

  try {
    const componentData = JSON.parse(event.dataTransfer!.getData('application/json'))
    addComponent(componentData, event)
  } catch (error) {
    console.error('Failed to parse dropped component data:', error)
  }
}

const addComponent = (componentDef: any, event?: DragEvent) => {
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

  emit('component-added', component)
}

const moveComponent = (fromIndex: number, direction: number) => {
  const toIndex = fromIndex + direction
  if (toIndex < 0 || toIndex >= props.schema.components.length) return

  const components = [...props.schema.components]
  const [moved] = components.splice(fromIndex, 1)
  components.splice(toIndex, 0, moved)

  // Update the schema by emitting the change
  const updatedSchema = { ...props.schema, components }
  emit('component-updated', {
    id: generateId(),
    type: moved.type,
    schema: moved,
  })
}

const deleteComponent = (componentSchema: ComponentSchema) => {
  const component: ComponentInstance = {
    id: generateId(),
    type: componentSchema.type,
    schema: componentSchema,
  }
  emit('component-deleted', component)
}

const generateId = (): string => {
  return `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

const generateUniqueKey = (type: string): string => {
  let counter = 1
  let key = `${type}${counter}`

  while (props.schema.components.some(comp => comp.key === key)) {
    counter++
    key = `${type}${counter}`
  }

  return key
}
</script>

<style scoped>
.form-canvas {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: white;
}

.canvas-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  background-color: #f8f9fa;
}

.canvas-title {
  display: flex;
  align-items: center;
  font-weight: 500;
  color: #495057;
}

.canvas-info {
  font-size: 12px;
  color: #6c757d;
}

.canvas-drop-zone {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  min-height: 200px;
  border: 2px dashed transparent;
  transition: border-color 0.2s ease;
}

.canvas-drop-zone.drop-active {
  border-color: #007bff;
  background-color: #f8f9ff;
}

.canvas-content {
  max-width: 800px;
  margin: 0 auto;
}

.empty-canvas {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  text-align: center;
  color: #6c757d;
}

.canvas-component-wrapper {
  position: relative;
  margin-bottom: 16px;
  border-radius: 8px;
  overflow: hidden;
  transition: box-shadow 0.2s ease;
}

.canvas-component-wrapper:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.canvas-component-wrapper.selected {
  box-shadow: 0 0 0 2px #007bff, 0 4px 12px rgba(0, 123, 255, 0.15);
}

.component-toolbar {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background-color: #007bff;
  color: white;
}

.component-toolbar .v-btn {
  color: white;
}

.canvas-component {
  padding: 16px;
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 0 0 8px 8px;
}
</style>