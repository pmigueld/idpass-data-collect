import type { Component } from 'vue'

export interface ComponentSchema {
  type: string
  key: string
  label?: string
  placeholder?: string
  description?: string
  validate?: {
    required?: boolean
    minLength?: number
    maxLength?: number
    min?: number
    max?: number
    pattern?: string
    custom?: string
  }
  defaultValue?: any
  multiple?: boolean
  rows?: number
  step?: number
  [key: string]: any
}

export interface ComponentDefinition {
  type: string
  label: string
  group: string
  icon: string
  weight?: number
  builder: Component
  runtime: Component
  schema: () => ComponentSchema
  settings: () => ComponentSettingsDefinition[]
  documentation?: string
}

export interface ComponentSettingsDefinition {
  key: string
  label: string
  type: 'text' | 'number' | 'boolean' | 'select' | 'textarea' | 'json' | 'array'
  placeholder?: string
  tooltip?: string
  required?: boolean
  defaultValue?: any
  options?: Array<{ label: string; value: any }>
  multiple?: boolean
  min?: number
  max?: number
  validation?: {
    pattern?: string
    custom?: (value: any) => boolean | string
  }
}

export interface FormSchema {
  display?: string
  components: ComponentSchema[]
  settings?: {
    pdf?: any
    cors?: any
    [key: string]: any
  }
}

export interface ComponentInstance {
  id: string
  type: string
  schema: ComponentSchema
  parent?: string
}

export interface FormBuilderState {
  schema: FormSchema
  selectedComponent: ComponentInstance | null
  draggedComponent: ComponentDefinition | null
  isPreviewMode: boolean
}