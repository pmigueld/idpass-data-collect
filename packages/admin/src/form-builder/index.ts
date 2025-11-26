// Main components
export { default as FormBuilder } from './components/FormBuilder.vue'
export { default as ComponentPalette } from './components/ComponentPalette.vue'
export { default as FormCanvas } from './components/FormCanvas.vue'
export { default as ComponentSettings } from './components/ComponentSettings.vue'
export { default as PreviewPane } from './components/PreviewPane.vue'
export { default as BaseComponent } from './components/BaseComponent.vue'

// Setting components
export { default as TextSetting } from './components/settings/TextSetting.vue'
export { default as NumberSetting } from './components/settings/NumberSetting.vue'
export { default as BooleanSetting } from './components/settings/BooleanSetting.vue'
export { default as SelectSetting } from './components/settings/SelectSetting.vue'
export { default as TextareaSetting } from './components/settings/TextareaSetting.vue'
export { default as JsonSetting } from './components/settings/JsonSetting.vue'
export { default as ArraySetting } from './components/settings/ArraySetting.vue'

// All available components
export { allComponents } from './components'

// Types
export type {
  ComponentSchema,
  ComponentDefinition,
  ComponentSettingsDefinition,
  FormSchema,
  ComponentInstance,
  FormBuilderState
} from './types/ComponentDefinition'

// Utilities
export { componentRegistry, registerComponents, createComponentDefinition } from './utils/ComponentRegistry'
export * from './utils/FormSchema'
export * from './utils/SchemaValidator'

// Helper function to register all default components
import { componentRegistry } from './utils/ComponentRegistry'
import { allComponents } from './components'

export function registerDefaultComponents(): void {
  allComponents.forEach(component => componentRegistry.register(component))
}