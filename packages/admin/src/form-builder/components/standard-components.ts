import { createComponentDefinition } from '../utils/ComponentRegistry'
import type { ComponentSchema } from '../types/ComponentDefinition'

// Import components
import TextField from './fields/TextField.vue'
import TextFieldRuntime from './fields/TextFieldRuntime.vue'
import TextArea from './fields/TextArea.vue'
import TextAreaRuntime from './fields/TextAreaRuntime.vue'
import SelectField from './fields/SelectField.vue'
import SelectFieldRuntime from './fields/SelectFieldRuntime.vue'
import NumberField from './fields/NumberField.vue'
import NumberFieldRuntime from './fields/NumberFieldRuntime.vue'
import Checkbox from './fields/Checkbox.vue'
import CheckboxRuntime from './fields/CheckboxRuntime.vue'

// Text Field Component
export const textFieldDefinition = createComponentDefinition({
  type: 'textfield',
  label: 'Text Field',
  group: 'basic',
  icon: 'mdi-text-box-outline',
  builder: TextField,
  runtime: TextFieldRuntime,
  schema: (): ComponentSchema => ({
    type: 'textfield',
    key: '',
    label: 'Text Field',
    placeholder: '',
    description: '',
    validate: {
      required: false
    }
  }),
  settings: () => [
    {
      key: 'placeholder',
      label: 'Placeholder',
      type: 'text',
      placeholder: 'Enter placeholder text'
    },
    {
      key: 'description',
      label: 'Description',
      type: 'textarea',
      placeholder: 'Enter field description'
    },
    {
      key: 'defaultValue',
      label: 'Default Value',
      type: 'text',
      placeholder: 'Enter default value'
    }
  ]
})

// Text Area Component
export const textAreaDefinition = createComponentDefinition({
  type: 'textarea',
  label: 'Text Area',
  group: 'basic',
  icon: 'mdi-text-box-multiple-outline',
  builder: TextArea,
  runtime: TextAreaRuntime,
  schema: (): ComponentSchema => ({
    type: 'textarea',
    key: '',
    label: 'Text Area',
    placeholder: '',
    description: '',
    rows: 3,
    validate: {
      required: false
    }
  }),
  settings: () => [
    {
      key: 'placeholder',
      label: 'Placeholder',
      type: 'text',
      placeholder: 'Enter placeholder text'
    },
    {
      key: 'description',
      label: 'Description',
      type: 'textarea',
      placeholder: 'Enter field description'
    },
    {
      key: 'rows',
      label: 'Rows',
      type: 'number',
      placeholder: '3',
      min: 1,
      max: 20
    },
    {
      key: 'defaultValue',
      label: 'Default Value',
      type: 'textarea',
      placeholder: 'Enter default value'
    }
  ]
})

// Number Field Component
export const numberFieldDefinition = createComponentDefinition({
  type: 'number',
  label: 'Number',
  group: 'basic',
  icon: 'mdi-numeric',
  builder: NumberField,
  runtime: NumberFieldRuntime,
  schema: (): ComponentSchema => ({
    type: 'number',
    key: '',
    label: 'Number',
    placeholder: '',
    description: '',
    step: 1,
    validate: {
      required: false
    }
  }),
  settings: () => [
    {
      key: 'placeholder',
      label: 'Placeholder',
      type: 'text',
      placeholder: 'Enter placeholder text'
    },
    {
      key: 'description',
      label: 'Description',
      type: 'textarea',
      placeholder: 'Enter field description'
    },
    {
      key: 'step',
      label: 'Step',
      type: 'number',
      placeholder: '1',
      min: 0.1,
      max: 100
    },
    {
      key: 'defaultValue',
      label: 'Default Value',
      type: 'number',
      placeholder: 'Enter default value'
    }
  ]
})

// Select Field Component
export const selectFieldDefinition = createComponentDefinition({
  type: 'select',
  label: 'Select',
  group: 'basic',
  icon: 'mdi-form-dropdown',
  builder: SelectField,
  runtime: SelectFieldRuntime,
  schema: (): ComponentSchema => ({
    type: 'select',
    key: '',
    label: 'Select',
    placeholder: '',
    description: '',
    data: {
      values: [
        { label: 'Option 1', value: 'option1' },
        { label: 'Option 2', value: 'option2' }
      ]
    },
    validate: {
      required: false
    }
  }),
  settings: () => [
    {
      key: 'placeholder',
      label: 'Placeholder',
      type: 'text',
      placeholder: 'Enter placeholder text'
    },
    {
      key: 'description',
      label: 'Description',
      type: 'textarea',
      placeholder: 'Enter field description'
    },
    {
      key: 'data.values',
      label: 'Options',
      type: 'array',
      placeholder: 'Add options'
    },
    {
      key: 'multiple',
      label: 'Multiple Selection',
      type: 'boolean'
    },
    {
      key: 'defaultValue',
      label: 'Default Value',
      type: 'text',
      placeholder: 'Enter default value'
    }
  ]
})

// Checkbox Component
export const checkboxDefinition = createComponentDefinition({
  type: 'checkbox',
  label: 'Checkbox',
  group: 'basic',
  icon: 'mdi-checkbox-outline',
  builder: Checkbox,
  runtime: CheckboxRuntime,
  schema: (): ComponentSchema => ({
    type: 'checkbox',
    key: '',
    label: 'Checkbox',
    description: '',
    defaultValue: false,
    validate: {
      required: false
    }
  }),
  settings: () => [
    {
      key: 'description',
      label: 'Description',
      type: 'textarea',
      placeholder: 'Enter field description'
    },
    {
      key: 'defaultValue',
      label: 'Default Value',
      type: 'boolean'
    }
  ]
})

// Export all standard components
export const standardComponents = [
  textFieldDefinition,
  textAreaDefinition,
  numberFieldDefinition,
  selectFieldDefinition,
  checkboxDefinition
]