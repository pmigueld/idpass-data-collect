import type { Entity, EntityValidationRule } from './types'

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string[]>
}

export const validateEntity = (
  entity: Entity,
  rules: EntityValidationRule[]
): ValidationResult => {
  const errors: Record<string, string[]> = {}

  for (const rule of rules) {
    const value = (entity as any)[rule.field]
    const fieldErrors: string[] = []

    // Required validation
    if (rule.required && (value === undefined || value === null || value === '')) {
      fieldErrors.push(`${rule.field} is required`)
    }

    // Skip other validations if field is empty and not required
    if ((value === undefined || value === null || value === '') && !rule.required) {
      continue
    }

    // Type validation
    if (rule.type && value !== undefined && value !== null) {
      const actualType = Array.isArray(value) ? 'array' : typeof value
      if (actualType !== rule.type) {
        fieldErrors.push(`${rule.field} must be of type ${rule.type}, got ${actualType}`)
      }
    }

    // String length validation
    if (rule.type === 'string' && typeof value === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        fieldErrors.push(`${rule.field} must be at least ${rule.minLength} characters`)
      }
      if (rule.maxLength && value.length > rule.maxLength) {
        fieldErrors.push(`${rule.field} must be at most ${rule.maxLength} characters`)
      }
    }

    // Pattern validation
    if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
      fieldErrors.push(`${rule.field} format is invalid`)
    }

    // Custom validation
    if (rule.custom) {
      try {
        const result = rule.custom(value, entity)
        if (result !== true) {
          fieldErrors.push(result || `${rule.field} failed custom validation`)
        }
      } catch (error) {
        fieldErrors.push(`${rule.field} validation error: ${error}`)
      }
    }

    if (fieldErrors.length > 0) {
      errors[rule.field] = fieldErrors
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

export const createDefaultValidationRules = (): EntityValidationRule[] => [
  {
    field: 'name',
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 255
  },
  {
    field: 'type',
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 100
  },
  {
    field: 'description',
    type: 'string',
    maxLength: 1000
  }
]