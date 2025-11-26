import type { FormSchema, ComponentSchema } from '../types/ComponentDefinition'

/**
 * Creates a new empty form schema
 */
export function createEmptyFormSchema(): FormSchema {
  return {
    display: 'form',
    components: []
  }
}

/**
 * Adds a component to a form schema
 */
export function addComponentToSchema(
  schema: FormSchema,
  componentSchema: ComponentSchema
): FormSchema {
  return {
    ...schema,
    components: [...schema.components, componentSchema]
  }
}

/**
 * Removes a component from a form schema by key
 */
export function removeComponentFromSchema(
  schema: FormSchema,
  componentKey: string
): FormSchema {
  return {
    ...schema,
    components: schema.components.filter(comp => comp.key !== componentKey)
  }
}

/**
 * Updates a component in a form schema
 */
export function updateComponentInSchema(
  schema: FormSchema,
  componentKey: string,
  updates: Partial<ComponentSchema>
): FormSchema {
  return {
    ...schema,
    components: schema.components.map(comp =>
      comp.key === componentKey ? { ...comp, ...updates } : comp
    )
  }
}

/**
 * Moves a component to a new position in the schema
 */
export function moveComponentInSchema(
  schema: FormSchema,
  fromIndex: number,
  toIndex: number
): FormSchema {
  const components = [...schema.components]
  const [moved] = components.splice(fromIndex, 1)
  components.splice(toIndex, 0, moved)

  return {
    ...schema,
    components
  }
}

/**
 * Finds a component in the schema by key
 */
export function findComponentInSchema(
  schema: FormSchema,
  componentKey: string
): ComponentSchema | undefined {
  return schema.components.find(comp => comp.key === componentKey)
}

/**
 * Validates that all component keys are unique
 */
export function validateUniqueKeys(schema: FormSchema): string[] {
  const errors: string[] = []
  const keys = new Set<string>()

  schema.components.forEach((comp, index) => {
    if (!comp.key) {
      errors.push(`Component at index ${index} has no key`)
    } else if (keys.has(comp.key)) {
      errors.push(`Duplicate key "${comp.key}" found`)
    } else {
      keys.add(comp.key)
    }
  })

  return errors
}

/**
 * Generates a unique key for a component type
 */
export function generateUniqueKey(
  schema: FormSchema,
  componentType: string
): string {
  let counter = 1
  let key = `${componentType}${counter}`

  while (schema.components.some(comp => comp.key === key)) {
    counter++
    key = `${componentType}${counter}`
  }

  return key
}

/**
 * Converts a Form.io schema to our internal format
 */
export function convertFromFormioSchema(formioSchema: any): FormSchema {
  return {
    display: formioSchema.display || 'form',
    components: formioSchema.components || [],
    settings: formioSchema.settings
  }
}

/**
 * Converts our internal schema to Form.io format
 */
export function convertToFormioSchema(schema: FormSchema): any {
  return {
    display: schema.display,
    components: schema.components,
    settings: schema.settings
  }
}

/**
 * Clones a form schema deeply
 */
export function cloneFormSchema(schema: FormSchema): FormSchema {
  return JSON.parse(JSON.stringify(schema))
}