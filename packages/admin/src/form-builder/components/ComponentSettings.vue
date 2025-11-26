<template>
  <div class="component-settings">
    <div class="settings-header">
          <h4 class="mb-0">Component Settings</h4>
          <div class="component-type">{{ props.component.schema.type }}</div>
    </div>

    <div class="settings-content">
      <v-form @submit.prevent="handleSubmit">
        <div class="settings-section">
          <h5 class="section-title">Basic Settings</h5>

          <!-- Label -->
          <v-text-field
            v-model="localSchema.label"
            label="Label"
            placeholder="Enter field label"
            variant="outlined"
            density="compact"
            class="mb-3"
            @input="handleChange"
          />

          <!-- Key -->
          <v-text-field
            v-model="localSchema.key"
            label="Key"
            placeholder="Enter field key"
            variant="outlined"
            density="compact"
            class="mb-3"
            :rules="[rules.required, rules.uniqueKey]"
            @input="handleChange"
          />

          <!-- Placeholder -->
          <v-text-field
            v-model="localSchema.placeholder"
            label="Placeholder"
            placeholder="Enter placeholder text"
            variant="outlined"
            density="compact"
            class="mb-3"
            @input="handleChange"
          />

          <!-- Description -->
          <v-textarea
            v-model="localSchema.description"
            label="Description"
            placeholder="Enter field description"
            variant="outlined"
            density="compact"
            rows="2"
            class="mb-3"
            @input="handleChange"
          />

          <!-- Default Value -->
          <v-text-field
            v-model="localSchema.defaultValue"
            label="Default Value"
            placeholder="Enter default value"
            variant="outlined"
            density="compact"
            class="mb-3"
            @input="handleChange"
          />
        </div>

        <v-divider class="my-4" />

        <div class="settings-section">
          <h5 class="section-title">Validation</h5>

          <!-- Required -->
          <v-checkbox
            v-model="localSchema.validate!.required"
            label="Required"
            density="compact"
            class="mb-2"
            @change="handleChange"
          />

          <!-- Min Length -->
          <v-text-field
            v-model.number="localSchema.validate!.minLength"
            label="Minimum Length"
            type="number"
            variant="outlined"
            density="compact"
            class="mb-3"
            :disabled="!localSchema.validate!.required && !localSchema.validate!.minLength"
            @input="handleChange"
          />

          <!-- Max Length -->
          <v-text-field
            v-model.number="localSchema.validate!.maxLength"
            label="Maximum Length"
            type="number"
            variant="outlined"
            density="compact"
            class="mb-3"
            :disabled="!localSchema.validate!.required && !localSchema.validate!.maxLength"
            @input="handleChange"
          />

          <!-- Pattern -->
          <v-text-field
            v-model="localSchema.validate!.pattern"
            label="Pattern (Regex)"
            placeholder="e.g., ^[a-zA-Z]+$"
            variant="outlined"
            density="compact"
            class="mb-3"
            @input="handleChange"
          />
        </div>

        <!-- Custom Settings based on component type -->
        <div v-if="customSettings.length > 0" class="settings-section">
          <v-divider class="my-4" />
          <h5 class="section-title">Component Settings</h5>

          <component
            v-for="setting in customSettings"
            :key="setting.key"
            :is="getSettingComponent(setting.type)"
            v-model="localSchema[setting.key]"
            :setting="setting"
            @change="handleChange"
          />
        </div>
      </v-form>
    </div>

    <div class="settings-footer">
      <v-btn
        variant="outlined"
        color="error"
        size="small"
        @click="$emit('delete')"
      >
        <v-icon left>mdi-delete</v-icon>
        Delete Component
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import { componentRegistry } from '../utils/ComponentRegistry'
import type { ComponentInstance, ComponentSchema, ComponentSettingsDefinition } from '../types/ComponentDefinition'

// Import setting components
import TextSetting from './settings/TextSetting.vue'
import NumberSetting from './settings/NumberSetting.vue'
import BooleanSetting from './settings/BooleanSetting.vue'
import SelectSetting from './settings/SelectSetting.vue'
import TextareaSetting from './settings/TextareaSetting.vue'
import JsonSetting from './settings/JsonSetting.vue'
import ArraySetting from './settings/ArraySetting.vue'

interface Props {
  component: ComponentInstance
}

interface Emits {
  (e: 'update', component: ComponentInstance): void
  (e: 'delete'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const localSchema = reactive<ComponentSchema>({ ...props.component.schema })
const customSettings = ref<ComponentSettingsDefinition[]>([])

const rules = {
  required: (value: string) => !!value || 'This field is required',
  uniqueKey: (value: string) => {
    // TODO: Implement key uniqueness validation
    return true
  }
}

const getSettingComponent = (type: string) => {
  switch (type) {
    case 'text': return TextSetting
    case 'number': return NumberSetting
    case 'boolean': return BooleanSetting
    case 'select': return SelectSetting
    case 'textarea': return TextareaSetting
    case 'json': return JsonSetting
    case 'array': return ArraySetting
    default: return TextSetting
  }
}

const loadCustomSettings = () => {
  const definition = componentRegistry.get(props.component.type)
  if (definition) {
    customSettings.value = definition.settings()
  }
}

const handleChange = () => {
  const updatedComponent: ComponentInstance = {
    ...props.component,
    schema: { ...localSchema }
  }
  emit('update', updatedComponent)
}

const handleSubmit = () => {
  handleChange()
}

// Watch for component changes
watch(() => props.component, (newComponent) => {
  Object.assign(localSchema, newComponent.schema)
  loadCustomSettings()
}, { deep: true })

onMounted(() => {
  loadCustomSettings()
})
</script>

<style scoped>
.component-settings {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.settings-header {
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  background-color: #f8f9fa;
}

.component-type {
  font-size: 12px;
  color: #6c757d;
  text-transform: capitalize;
  margin-top: 4px;
}

.settings-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.settings-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #495057;
  margin-bottom: 16px;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 8px;
}

.settings-footer {
  padding: 16px;
  border-top: 1px solid #e0e0e0;
  background-color: #f8f9fa;
}
</style>