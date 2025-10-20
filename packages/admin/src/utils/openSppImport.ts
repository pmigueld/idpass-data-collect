// OpenSPP YAML Import Parser for v7 Program Specification
// Supports entities, fields, external systems, reference tables, and derived fields

import * as yaml from 'js-yaml'

export interface RawExternalSystem {
  id?: string
  role?: string
  domain?: string
  interface?: {
    type?: string
    transport?: string
    format?: string
    schema_version?: string
  }
  data_contract?: {
    record_type?: string
    key_fields?: string[]
  }
}

export interface RawReferenceTable {
  id?: string
  description?: string
  rows?: Record<string, unknown>[]
}

export interface RawDerivedField {
  id?: string
  label?: string
  expression?: string
  purpose?: string
  dependencies?: string[]
}

export interface RawSpecification {
  program?: RawProgram
  entities?: RawEntity[]
  external_systems?: RawExternalSystem[]
  reference_tables?: RawReferenceTable[]
  derived_fields?: RawDerivedField[]
  integrations?: {
    id_system?: string[]
    registries?: string[]
  }
}

export interface RawProgram {
  id?: string
  name?: string
  description?: string
  version?: string
  artifact_id?: string
}

export interface RawEntity {
  id?: string
  name?: string
  label?: string
  type?: string
  fields?: RawField[]
  relationships?: RawRelationship[]
}

export interface RawField {
  id?: string
  name?: string
  label?: string
  type?: string
  required?: boolean
  constraints?: RawConstraint[]
  enum?: RawEnum[]
  reference_table?: string
}

export interface RawConstraint {
  type?: string
  value?: unknown
}

export interface RawEnum {
  id?: string
  label?: string
}

export interface RawRelationship {
  id?: string
  entity?: string
  type?: string
  required?: boolean
}

export interface ExternalSyncField {
  key: string
  label: string
  type: string
  required?: boolean
}

export interface ImportedEntityForm {
  name: string
  title: string
  dependsOn?: string
  formio: Record<string, unknown>
}

export interface OpenSppImportResult {
  name?: string
  description?: string
  version?: string
  artifactId?: string
  entityForms: ImportedEntityForm[]
  externalSync?: {
    type?: string
    url: string
    extraFields: ExternalSyncField[]
  }
  metadata?: {
    hasUnsupportedFields: boolean
    hasDerivedFields: boolean
    warnings: string[]
  }
}

// Supported Form.io field types mapping from OpenSPP field types
export const SUPPORTED_FIELD_TYPES: Record<string, string> = {
  string: 'textfield',
  text: 'textarea',
  number: 'number',
  integer: 'number',
  decimal: 'number',
  boolean: 'checkbox',
  date: 'datetime',
  enum: 'select',
  select: 'select',
  multiselect: 'selectboxes',
  admin_code: 'select',
  currency: 'currency',
  phone: 'phoneNumber',
  email: 'email',
  // Unsupported types will fallback to textfield with warning
}

/**
 * Parse OpenSPP Program Specification YAML
 */
export function parseOpenSppProgramSpecification(yamlText: string): OpenSppImportResult {
  try {
    const rawSpec: RawSpecification = parseYamlSafely(yamlText)

    const result: OpenSppImportResult = {
      name: rawSpec.program?.name,
      description: rawSpec.program?.description,
      version: rawSpec.program?.version || '1',
      artifactId: rawSpec.program?.artifact_id,
      entityForms: [],
      externalSync: buildExternalSyncConfig(rawSpec.external_systems, rawSpec.integrations),
      metadata: {
        hasUnsupportedFields: false,
        hasDerivedFields: false,
        warnings: []
      }
    }

    // Process entities into entity forms
    if (rawSpec.entities) {
      for (const entity of rawSpec.entities) {
        const entityForm = buildEntityForm(entity, rawSpec.reference_tables || [], rawSpec.derived_fields || [])
        result.entityForms.push(entityForm)

        // Add derived field annotations to all forms since they're program-wide
        if (rawSpec.derived_fields && rawSpec.derived_fields.length > 0) {
          const derivedAnnotations = buildDerivedFieldAnnotations(entity, rawSpec.derived_fields)
          Object.assign(entityForm.formio, derivedAnnotations)
        }
      }
    }

    // Process derived fields
    if (rawSpec.derived_fields && rawSpec.derived_fields.length > 0) {
      result.metadata!.hasDerivedFields = true
      result.metadata!.warnings.push(
        `${rawSpec.derived_fields.length} derived field(s) found. CEL expressions require manual implementation.`
      )
    }

    // Check for unsupported field types
    result.metadata!.hasUnsupportedFields = checkForUnsupportedFields(rawSpec.entities || [])

    return result
  } catch (error) {
    throw new Error(`Failed to parse OpenSPP YAML: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Safely parse YAML text
 */
function parseYamlSafely(yamlText: string): RawSpecification {
  try {
    return yaml.load(yamlText) as RawSpecification
  } catch (error) {
    throw new Error(`Invalid YAML format: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Build external sync configuration from OpenSPP external systems
 */
function buildExternalSyncConfig(
  externalSystems?: RawExternalSystem[],
  integrations?: { registries?: string[] }
): OpenSppImportResult['externalSync'] {
  // Find first evidence_provider role external system
  const primarySystem = externalSystems?.find(s => s.role === 'evidence_provider')

  if (!primarySystem) {
    return { type: undefined, url: '', extraFields: [] }
  }

  // Map interface type to adapter type
  const adapterType = mapInterfaceToAdapter(primarySystem.interface?.type)

  return {
    type: adapterType,
    url: '', // User must fill this
    extraFields: buildExtraFieldsFromContract(primarySystem.data_contract)
  }
}

/**
 * Map OpenSPP interface type to adapter type
 */
function mapInterfaceToAdapter(interfaceType?: string): string | undefined {
  switch (interfaceType) {
    case 'rest_api':
      return 'openspp-adapter'
    case 'webhook':
      return 'openfn-adapter'
    default:
      return undefined
  }
}

/**
 * Build extra fields from data contract
 */
function buildExtraFieldsFromContract(dataContract?: { key_fields?: string[] }): ExternalSyncField[] {
  if (!dataContract?.key_fields) return []

  return dataContract.key_fields.map(field => ({
    key: field,
    label: field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    type: 'string',
    required: true
  }))
}

/**
 * Build Form.io entity form from OpenSPP entity
 */
function buildEntityForm(
  entity: RawEntity,
  referenceTables: RawReferenceTable[],
  derivedFields: RawDerivedField[]
): ImportedEntityForm {
  const formioComponents: Record<string, unknown>[] = []

  if (entity.fields) {
    for (const field of entity.fields) {
      const component = buildFormioComponent(field, referenceTables)
      if (component) {
        formioComponents.push(component)
      }
    }
  }

  // Add derived fields as annotations
  const derivedFieldAnnotations = buildDerivedFieldAnnotations(entity, derivedFields)

  return {
    name: entity.id || entity.name || 'unnamed',
    title: entity.label || entity.name || 'Unnamed Entity',
    dependsOn: entity.relationships?.find(r => r.type === 'parent')?.entity,
    formio: {
      display: 'form',
      components: formioComponents,
      ...derivedFieldAnnotations
    }
  }
}

/**
 * Build Form.io component from OpenSPP field
 */
function buildFormioComponent(
  field: RawField,
  referenceTables: RawReferenceTable[]
): Record<string, unknown> | null {
  const fieldType = field.type || 'string'
  const formioType = SUPPORTED_FIELD_TYPES[fieldType] || 'textfield'

  const component: Record<string, unknown> = {
    label: field.label || field.name || field.id || 'Unnamed Field',
    key: field.id || field.name || 'unnamed',
    type: formioType,
    validate: {
      required: field.required || false
    }
  }

  // Handle enum/select fields
  if (fieldType === 'enum' && field.enum) {
    ;(component as any).data = {
      values: field.enum.map(e => ({
        label: e.label || e.id,
        value: e.id
      }))
    }
  }

  // Handle reference table fields
  if (field.reference_table) {
    const referenceData = buildSelectFromReferenceTable(field, referenceTables)
    if (referenceData) {
      ;(component as any).data = referenceData
    }
  }

  // Handle special field types with enhanced configurations
  if (fieldType === 'admin_code') {
    // Hierarchical admin code structure - simulate with grouped select
    ;(component as any).placeholder = 'Select administrative code'
    ;(component as any).data = {
      values: [
        { label: 'National', value: 'national' },
        { label: 'Regional', value: 'regional' },
        { label: 'Local', value: 'local' }
      ]
    }
    ;(component as any).customClass = 'admin-code-field'
  }

  if (fieldType === 'currency') {
    ;(component as any).currency = 'USD' // Default, could be made configurable
    ;(component as any).delimiter = true
    ;(component as any).decimalLimit = 2
    ;(component as any).requireDecimal = false
  }

  if (fieldType === 'phone') {
    ;(component as any).inputMask = '(999) 999-9999'
    ;(component as any).placeholder = 'Enter phone number'
  }

  if (fieldType === 'email') {
    const validate = (component as any).validate || {}
    ;(component as any).validate = {
      ...validate,
      pattern: '^[^@]+@[^@]+\\.[^@]+$'
    }
    ;(component as any).placeholder = 'Enter email address'
  }

  // Add field constraints if present
  if (field.constraints) {
    field.constraints.forEach(constraint => {
      switch (constraint.type) {
        case 'min':
          ;(component as any).validate = { ...(component as any).validate, min: constraint.value }
          break
        case 'max':
          ;(component as any).validate = { ...(component as any).validate, max: constraint.value }
          break
        case 'pattern':
          ;(component as any).validate = { ...(component as any).validate, pattern: constraint.value }
          break
        case 'minLength':
          ;(component as any).validate = { ...(component as any).validate, minLength: constraint.value }
          break
        case 'maxLength':
          ;(component as any).validate = { ...(component as any).validate, maxLength: constraint.value }
          break
      }
    })
  }

  return component
}

/**
 * Build select options from reference table
 */
function buildSelectFromReferenceTable(
  field: RawField,
  referenceTables: RawReferenceTable[]
): Record<string, unknown> | null {
  const referenceTable = referenceTables.find(rt => rt.id === field.reference_table)
  if (!referenceTable?.rows) return null

  return {
    values: referenceTable.rows.map(row => ({
      label: String(row.label || row.name || row.id || 'Unknown'),
      value: row.id || row.value
    }))
  }
}

/**
 * Build derived field annotations for the form
 */
function buildDerivedFieldAnnotations(
  entity: RawEntity,
  derivedFields: RawDerivedField[]
): Record<string, unknown> {
  const annotations: Record<string, unknown> = {}

  // Add derived field descriptions as comments
  derivedFields.forEach(df => {
    if (df.expression) {
      annotations[`derived_${df.id}`] = {
        type: 'htmlelement',
        tag: 'div',
        content: `<div class="alert alert-info">
          <strong>Derived Field: ${df.label || df.id}</strong><br/>
          Expression: <code>${df.expression}</code><br/>
          <small class="text-muted">This field requires manual implementation of the CEL expression</small>
        </div>`
      }
    }
  })

  return annotations
}

/**
 * Check for unsupported field types
 */
function checkForUnsupportedFields(entities: RawEntity[]): boolean {
  const allFieldTypes = new Set<string>()

  entities.forEach(entity => {
    entity.fields?.forEach(field => {
      if (field.type) {
        allFieldTypes.add(field.type)
      }
    })
  })

  // Check if any field types are not in our supported list
  return Array.from(allFieldTypes).some(type => !(type in SUPPORTED_FIELD_TYPES))
}