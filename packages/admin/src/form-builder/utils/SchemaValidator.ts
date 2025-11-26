import type { FormSchema, ComponentSchema } from '../types/ComponentDefinition'
import { componentRegistry } from './ComponentRegistry'

export interface ValidationError {
  component?: string
  field?: string
  message: string
  severity: 'error' | 'warning'
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationError[]
}

/**
 * Validates a complete form schema
 */
export function validateFormSchema(schema: FormSchema): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationError[] = []

  // Check basic schema structure
  if (!schema.components || !Array.isArray(schema.components)) {
    errors.push({
      message: 'Schema must have a components array',
      severity: 'error'
    })
    return { isValid: false, errors, warnings }
  }

  // Validate each component
  const keySet = new Set<string>()

  schema.components.forEach((component, index) => {
    const componentErrors = validateComponent(component, index)
    errors.push(...componentErrors.errors)
    warnings.push(...componentErrors.warnings)

    // Check for duplicate keys
    if (component.key) {
      if (keySet.has(component.key)) {
        errors.push({
          component: component.key,
          message: `Duplicate component key: ${component.key}`,
          severity: 'error'
        })
      } else {
        keySet.add(component.key)
      }
    }
  })

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Validates a single component
 */
export function validateComponent(
  component: ComponentSchema,
  index?: number
): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationError[] = []
  const componentId = component.key || `component-${index}`

  // Check required fields
  if (!component.type) {
    errors.push({
      component: componentId,
      field: 'type',
      message: 'Component type is required',
      severity: 'error'
    })
  }

  if (!component.key) {
    errors.push({
      component: componentId,
      field: 'key',
      message: 'Component key is required',
      severity: 'error'
    })
  } else {
    // Validate key format
    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(component.key)) {
      errors.push({
        component: componentId,
        field: 'key',
        message: 'Component key must start with a letter and contain only letters, numbers, and underscores',
        severity: 'error'
      })
    }
  }

  // Check if component type is registered
  if (component.type) {
    const definition = componentRegistry.get(component.type)
    if (!definition) {
      warnings.push({
        component: componentId,
        field: 'type',
        message: `Unknown component type: ${component.type}`,
        severity: 'warning'
      })
    } else {
      // Validate component-specific settings
      const componentValidation = validateComponentSettings(component, definition)
      errors.push(...componentValidation.errors)
      warnings.push(...componentValidation.warnings)
    }
  }

  // Validate validation rules
  if (component.validate) {
    const validationErrors = validateValidationRules(component.validate, componentId)
    errors.push(...validationErrors)
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Validates component-specific settings
 */
function validateComponentSettings(
  component: ComponentSchema,
  definition: any
): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationError[] = []

  // Get component settings definition
  try {
    const settings = definition.settings()
    settings.forEach((setting: any) => {
      const value = component[setting.key]

      // Check required settings
      if (setting.required && (value === undefined || value === null || value === '')) {
        errors.push({
          component: component.key,
          field: setting.key,
          message: `${setting.label} is required`,
          severity: 'error'
        })
      }

      // Validate setting-specific rules
      if (setting.validation && value !== undefined) {
        const settingErrors = validateSettingRules(value, setting, component.key!)
        errors.push(...settingErrors)
      }
    })
  } catch (error) {
    warnings.push({
      component: component.key,
      message: 'Could not validate component settings',
      severity: 'warning'
    })
  }

  return { isValid: errors.length === 0, errors, warnings }
}

/**
 * Validates validation rules
 */
function validateValidationRules(
  validate: any,
  componentId: string
): ValidationError[] {
  const errors: ValidationError[] = []

  if (validate.minLength && validate.maxLength && validate.minLength > validate.maxLength) {
    errors.push({
      component: componentId,
      field: 'validate',
      message: 'Minimum length cannot be greater than maximum length',
      severity: 'error'
    })
  }

  if (validate.pattern) {
    try {
      new RegExp(validate.pattern)
    } catch {
      errors.push({
        component: componentId,
        field: 'validate.pattern',
        message: 'Invalid regular expression pattern',
        severity: 'error'
      })
    }
  }

  return errors
}

/**
 * Validates individual setting rules
 */
function validateSettingRules(
  value: any,
  setting: any,
  componentKey: string
): ValidationError[] {
  const errors: ValidationError[] = []

  if (setting.validation?.pattern && typeof value === 'string') {
    const regex = new RegExp(setting.validation.pattern)
    if (!regex.test(value)) {
      errors.push({
        component: componentKey,
        field: setting.key,
        message: `${setting.label} does not match required pattern`,
        severity: 'error'
      })
    }
  }

  if (setting.validation?.custom && typeof setting.validation.custom === 'function') {
    try {
      const isValid = setting.validation.custom(value)
      if (isValid === false) {
        errors.push({
          component: componentKey,
          field: setting.key,
          message: `${setting.label} is invalid`,
          severity: 'error'
        })
      } else if (typeof isValid === 'string') {
        errors.push({
          component: componentKey,
          field: setting.key,
          message: isValid,
          severity: 'error'
        })
      }
    } catch (error) {
      errors.push({
        component: componentKey,
        field: setting.key,
        message: `Validation error for ${setting.label}`,
        severity: 'error'
      })
    }
  }

  return errors
}