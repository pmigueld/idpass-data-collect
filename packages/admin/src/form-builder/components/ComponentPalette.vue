<template>
  <div class="component-palette">
    <div class="palette-header">
      <h4 class="mb-0">Components</h4>
    </div>

    <div class="palette-content">
      <v-expansion-panels variant="accordion" class="palette-groups">
        <v-expansion-panel
          v-for="group in groups"
          :key="group.name"
          :title="group.name"
          :value="group.name"
        >
          <v-expansion-panel-text>
            <div class="component-grid">
              <div
                v-for="component in group.components"
                :key="component.type"
                class="component-item"
                draggable="true"
                @dragstart="handleDragStart($event, component)"
                @click="handleComponentClick(component)"
              >
                <v-icon class="component-icon">{{ component.icon }}</v-icon>
                <div class="component-label">{{ component.label }}</div>
                <div class="component-tooltip">{{ component.label }}</div>
              </div>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { componentRegistry } from '../utils/ComponentRegistry'
import type { ComponentDefinition } from '../types/ComponentDefinition'

interface Emits {
  (e: 'component-selected', component: ComponentDefinition): void
}

const emit = defineEmits<Emits>()

const groups = ref<Array<{ name: string; components: ComponentDefinition[] }>>([])

const loadGroups = () => {
  const groupNames = componentRegistry.getGroups()
  groups.value = groupNames.map(name => ({
    name: formatGroupName(name),
    components: componentRegistry.getByGroup(name)
  }))
}

const formatGroupName = (name: string): string => {
  return name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const handleDragStart = (event: DragEvent, component: ComponentDefinition) => {
  event.dataTransfer!.setData('application/json', JSON.stringify(component))
  event.dataTransfer!.effectAllowed = 'copy'
}

const handleComponentClick = (component: ComponentDefinition) => {
  emit('component-selected', component)
}

onMounted(() => {
  loadGroups()
})
</script>

<style scoped>
.component-palette {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.palette-header {
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  background-color: #f8f9fa;
}

.palette-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.palette-groups {
  background: transparent;
}

.palette-groups :deep(.v-expansion-panel) {
  margin-bottom: 4px;
  border-radius: 4px;
  overflow: hidden;
}

.palette-groups :deep(.v-expansion-panel-title) {
  font-size: 14px;
  font-weight: 500;
  text-transform: capitalize;
}

.palette-groups :deep(.v-expansion-panel-text) {
  padding: 8px;
}

.component-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

.component-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background-color: white;
  cursor: grab;
  transition: all 0.2s ease;
  position: relative;
}

.component-item:hover {
  background-color: #f8f9fa;
  border-color: #007bff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.component-item:active {
  cursor: grabbing;
}

.component-icon {
  margin-right: 12px;
  color: #6c757d;
  font-size: 20px;
}

.component-label {
  font-size: 14px;
  font-weight: 500;
  color: #495057;
  flex: 1;
}

.component-tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: #333;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
  z-index: 1000;
}

.component-item:hover .component-tooltip {
  opacity: 1;
}

.component-item::after {
  content: '';
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-bottom-color: #333;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.component-item:hover::after {
  opacity: 1;
}
</style>