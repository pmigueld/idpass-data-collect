import type { Component } from 'vue'
import type { ComponentDefinition, ComponentSchema } from '../types/ComponentDefinition'

class ComponentRegistry {
  private components = new Map<string, ComponentDefinition>()
  private groups = new Map<string, ComponentDefinition[]>()

  register(definition: ComponentDefinition): void {
    if (this.components.has(definition.type)) {
      console.warn(`Component type "${definition.type}" is already registered. Overwriting.`)
    }

    this.components.set(definition.type, definition)

    // Update groups
    if (!this.groups.has(definition.group)) {
      this.groups.set(definition.group, [])
    }
    this.groups.get(definition.group)!.push(definition)
    this.groups.get(definition.group)!.sort((a, b) => (a.weight || 0) - (b.weight || 0))
  }

  unregister(type: string): void {
    const definition = this.components.get(type)
    if (definition) {
      this.components.delete(type)

      // Update groups
      const group = this.groups.get(definition.group)
      if (group) {
        const index = group.findIndex(comp => comp.type === type)
        if (index > -1) {
          group.splice(index, 1)
        }
      }
    }
  }

  get(type: string): ComponentDefinition | undefined {
    return this.components.get(type)
  }

  getAll(): ComponentDefinition[] {
    return Array.from(this.components.values())
  }

  getByGroup(group: string): ComponentDefinition[] {
    return this.groups.get(group) || []
  }

  getGroups(): string[] {
    return Array.from(this.groups.keys())
  }

  createSchema(type: string, overrides: Partial<ComponentSchema> = {}): ComponentSchema {
    const definition = this.get(type)
    if (!definition) {
      throw new Error(`Unknown component type: ${type}`)
    }

    const baseSchema = definition.schema()
    return {
      ...baseSchema,
      ...overrides,
      type: type, // Ensure type is always correct
    }
  }

  getBuilderComponent(type: string): Component | null {
    const definition = this.get(type)
    return definition?.builder || null
  }

  getRuntimeComponent(type: string): Component | null {
    const definition = this.get(type)
    return definition?.runtime || null
  }

  validateComponent(type: string): boolean {
    const definition = this.get(type)
    if (!definition) return false

    // Basic validation
    return !!(
      definition.type &&
      definition.label &&
      definition.group &&
      definition.icon &&
      definition.builder &&
      definition.runtime &&
      typeof definition.schema === 'function' &&
      typeof definition.settings === 'function'
    )
  }
}

// Singleton instance
export const componentRegistry = new ComponentRegistry()

// Helper function to register multiple components
export function registerComponents(components: ComponentDefinition[]): void {
  components.forEach(component => componentRegistry.register(component))
}

// Helper function to create a basic component definition
export function createComponentDefinition(options: {
  type: string
  label: string
  group: string
  icon: string
  weight?: number
  builder: Component
  runtime: Component
  schema: () => ComponentSchema
  settings: () => any[]
  documentation?: string
}): ComponentDefinition {
  return {
    ...options,
    weight: options.weight || 0,
  }
}