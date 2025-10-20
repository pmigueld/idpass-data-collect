import { parseOpenSppProgramSpecification } from '../openSppImport'

describe('OpenSPP YAML Import Parser', () => {
  describe('Basic YAML parsing', () => {
    it('should parse a basic OpenSPP specification', () => {
      const yaml = `
program:
  id: "test-program"
  name: "Test Program"
  description: "A test program"
  version: "1.0"
  artifact_id: "test-artifact"

entities:
  - id: "household"
    name: "household"
    label: "Household"
    fields:
      - id: "household_id"
        name: "household_id"
        label: "Household ID"
        type: "string"
        required: true
      - id: "household_size"
        name: "household_size"
        label: "Household Size"
        type: "number"
        required: true
  - id: "individual"
    name: "individual"
    label: "Individual"
    fields:
      - id: "first_name"
        name: "first_name"
        label: "First Name"
        type: "string"
        required: true
      - id: "last_name"
        name: "last_name"
        label: "Last Name"
        type: "string"
        required: true
      - id: "age"
        name: "age"
        label: "Age"
        type: "number"
        constraints:
          - type: "min"
            value: 0
          - type: "max"
            value: 150
`

      const result = parseOpenSppProgramSpecification(yaml)

      expect(result.name).toBe('Test Program')
      expect(result.description).toBe('A test program')
      expect(result.version).toBe('1.0')
      expect(result.artifactId).toBe('test-artifact')
      expect(result.entityForms).toHaveLength(2)

      // Check household entity form
      const householdForm = result.entityForms.find(f => f.name === 'household')
      expect(householdForm).toBeDefined()
      expect(householdForm?.title).toBe('Household')

      // Check individual entity form
      const individualForm = result.entityForms.find(f => f.name === 'individual')
      expect(individualForm).toBeDefined()
      expect(individualForm?.title).toBe('Individual')

      // Check metadata
      expect(result.metadata?.hasUnsupportedFields).toBe(false)
      expect(result.metadata?.hasDerivedFields).toBe(false)
      expect(result.metadata?.warnings).toHaveLength(0)
    })
  })

  describe('External sync configuration', () => {
    it('should map external systems to externalSync config', () => {
      const yaml = `
program:
  name: "Test Program"

external_systems:
  - id: "deped"
    role: "evidence_provider"
    interface:
      type: "rest_api"
      transport: "https"
      format: "json"
    data_contract:
      record_type: "enrollment"
      key_fields: ["student_id", "school_code"]

integrations:
  registries: ["education"]
`

      const result = parseOpenSppProgramSpecification(yaml)

      expect(result.externalSync?.type).toBe('openspp-adapter')
      expect(result.externalSync?.extraFields).toHaveLength(2)
      expect(result.externalSync?.extraFields[0].key).toBe('student_id')
      expect(result.externalSync?.extraFields[1].key).toBe('school_code')
    })

    it('should handle webhook interface type', () => {
      const yaml = `
program:
  name: "Test Program"

external_systems:
  - id: "doh"
    role: "evidence_provider"
    interface:
      type: "webhook"
`

      const result = parseOpenSppProgramSpecification(yaml)

      expect(result.externalSync?.type).toBe('openfn-adapter')
    })

    it('should return undefined type when no evidence provider found', () => {
      const yaml = `
program:
  name: "Test Program"

external_systems:
  - id: "other_system"
    role: "data_consumer"
`

      const result = parseOpenSppProgramSpecification(yaml)

      expect(result.externalSync?.type).toBeUndefined()
    })
  })

  describe('Reference tables', () => {
    it('should convert reference tables to select options', () => {
      const yaml = `
program:
  name: "Test Program"

entities:
  - id: "student"
    fields:
      - id: "grade_level"
        type: "string"
        reference_table: "grade_levels"

reference_tables:
  - id: "grade_levels"
    description: "Grade levels in school"
    rows:
      - id: "kinder"
        label: "Kindergarten"
      - id: "grade1"
        label: "Grade 1"
      - id: "grade2"
        label: "Grade 2"
`

      const result = parseOpenSppProgramSpecification(yaml)

      const studentForm = result.entityForms.find(f => f.name === 'student')
      expect(studentForm).toBeDefined()

      const gradeField = (studentForm?.formio.components as any[])?.find((c: any) => c.key === 'grade_level')
      expect(gradeField).toBeDefined()
      expect(gradeField?.data?.values).toHaveLength(3)
      expect(gradeField?.data?.values[0]).toEqual({ label: 'Kindergarten', value: 'kinder' })
    })
  })

  describe('Derived fields', () => {
    it('should add derived fields as annotations', () => {
      const yaml = `
program:
  name: "Test Program"

entities:
  - id: "beneficiary"
    fields:
      - id: "eligible"
        type: "boolean"

derived_fields:
  - id: "eligibility_score"
    label: "Eligibility Score"
    expression: "age >= 18 && income < 10000"
    purpose: "Determines program eligibility"
    dependencies: ["age", "income"]
`

      const result = parseOpenSppProgramSpecification(yaml)

      expect(result.metadata?.hasDerivedFields).toBe(true)
      expect(result.metadata?.warnings).toContain('1 derived field(s) found. CEL expressions require manual implementation.')

      const beneficiaryForm = result.entityForms.find(f => f.name === 'beneficiary')
      expect(beneficiaryForm).toBeDefined()

      // Check that derived field annotation was added
      const derivedAnnotation = beneficiaryForm?.formio.derived_eligibility_score as any
      expect(derivedAnnotation).toBeDefined()
      expect(derivedAnnotation.content).toContain('Derived Field: Eligibility Score')
      expect(derivedAnnotation.content).toContain('Expression: <code>age >= 18 && income < 10000</code>')
    })
  })

  describe('Advanced field types', () => {
    it('should handle currency fields', () => {
      const yaml = `
program:
  name: "Test Program"

entities:
  - id: "payment"
    fields:
      - id: "amount"
        type: "currency"
        label: "Payment Amount"
`

      const result = parseOpenSppProgramSpecification(yaml)

      const paymentForm = result.entityForms.find(f => f.name === 'payment')
      const amountField = (paymentForm?.formio.components as any[])?.find((c: any) => c.key === 'amount')

      expect(amountField?.type).toBe('currency')
      expect(amountField?.currency).toBe('USD')
    })

    it('should handle admin_code fields', () => {
      const yaml = `
program:
  name: "Test Program"

entities:
  - id: "location"
    fields:
      - id: "admin_code"
        type: "admin_code"
        label: "Administrative Code"
`

      const result = parseOpenSppProgramSpecification(yaml)

      const locationForm = result.entityForms.find(f => f.name === 'location')
      const adminCodeField = (locationForm?.formio.components as any[])?.find((c: any) => c.key === 'admin_code')

      expect(adminCodeField?.type).toBe('select')
      expect(adminCodeField?.customClass).toBe('admin-code-field')
    })

    it('should handle email fields with validation', () => {
      const yaml = `
program:
  name: "Test Program"

entities:
  - id: "contact"
    fields:
      - id: "email"
        type: "email"
        label: "Email Address"
`

      const result = parseOpenSppProgramSpecification(yaml)

      const contactForm = result.entityForms.find(f => f.name === 'contact')
      const emailField = (contactForm?.formio.components as any[])?.find((c: any) => c.key === 'email')

      expect(emailField?.type).toBe('email')
      expect(emailField?.validate?.pattern).toBe('^[^@]+@[^@]+\\.[^@]+$')
    })

    it('should handle phone fields with mask', () => {
      const yaml = `
program:
  name: "Test Program"

entities:
  - id: "contact"
    fields:
      - id: "phone"
        type: "phone"
        label: "Phone Number"
`

      const result = parseOpenSppProgramSpecification(yaml)

      const contactForm = result.entityForms.find(f => f.name === 'contact')
      const phoneField = (contactForm?.formio.components as any[])?.find((c: any) => c.key === 'phone')

      expect(phoneField?.type).toBe('phoneNumber')
      expect(phoneField?.inputMask).toBe('(999) 999-9999')
    })
  })

  describe('Field constraints', () => {
    it('should apply field constraints to components', () => {
      const yaml = `
program:
  name: "Test Program"

entities:
  - id: "person"
    fields:
      - id: "age"
        type: "number"
        label: "Age"
        constraints:
          - type: "min"
            value: 0
          - type: "max"
            value: 150
      - id: "name"
        type: "string"
        label: "Name"
        constraints:
          - type: "minLength"
            value: 2
          - type: "maxLength"
            value: 100
`

      const result = parseOpenSppProgramSpecification(yaml)

      const personForm = result.entityForms.find(f => f.name === 'person')
      const ageField = (personForm?.formio.components as any[])?.find((c: any) => c.key === 'age')
      const nameField = (personForm?.formio.components as any[])?.find((c: any) => c.key === 'name')

      expect(ageField?.validate?.min).toBe(0)
      expect(ageField?.validate?.max).toBe(150)
      expect(nameField?.validate?.minLength).toBe(2)
      expect(nameField?.validate?.maxLength).toBe(100)
    })
  })

  describe('Unsupported field types', () => {
    it('should detect unsupported field types', () => {
      const yaml = `
program:
  name: "Test Program"

entities:
  - id: "test"
    fields:
      - id: "custom_field"
        type: "custom_unsupported_type"
        label: "Custom Field"
`

      const result = parseOpenSppProgramSpecification(yaml)

      expect(result.metadata?.hasUnsupportedFields).toBe(true)
    })
  })

  describe('Error handling', () => {
    it('should throw error for invalid YAML', () => {
      expect(() => {
        parseOpenSppProgramSpecification('invalid: yaml: content: [')
      }).toThrow('Failed to parse OpenSPP YAML')
    })
  })
})