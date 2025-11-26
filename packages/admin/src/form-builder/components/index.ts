// Field components
export { default as TextField } from './fields/TextField.vue'
export { default as TextFieldRuntime } from './fields/TextFieldRuntime.vue'
export { default as TextArea } from './fields/TextArea.vue'
export { default as TextAreaRuntime } from './fields/TextAreaRuntime.vue'
export { default as SelectField } from './fields/SelectField.vue'
export { default as SelectFieldRuntime } from './fields/SelectFieldRuntime.vue'
export { default as NumberField } from './fields/NumberField.vue'
export { default as NumberFieldRuntime } from './fields/NumberFieldRuntime.vue'
export { default as Checkbox } from './fields/Checkbox.vue'
export { default as CheckboxRuntime } from './fields/CheckboxRuntime.vue'

// Special components
export { default as BiometricCaptureBuilder } from './BiometricCaptureBuilder.vue'
export { default as BiometricCaptureRuntime } from './BiometricCaptureRuntime.vue'

// Component definitions
export { standardComponents } from './standard-components'
export { biometricComponents } from './biometric-component'

// Re-export all components for easy registration
import { standardComponents } from './standard-components'
import { biometricComponents } from './biometric-component'

export const allComponents = [
  ...standardComponents,
  ...biometricComponents
]