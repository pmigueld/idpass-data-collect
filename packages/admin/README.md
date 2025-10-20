# admin

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

## OpenSPP Program Specification Import

The admin interface supports importing OpenSPP Program Specification files (v7 format) to automatically generate entity forms and external sync configurations.

### Features

- **Automated Form Generation**: Convert OpenSPP entities to Form.io entity forms
- **Field Type Mapping**: Support for standard and advanced field types (admin_code, currency, phone, email)
- **Reference Tables**: Convert OpenSPP reference tables to Form.io select options
- **External Sync**: Auto-configure external sync settings from OpenSPP external systems
- **Derived Fields**: Display CEL expressions as annotations for manual implementation

### Supported Field Types

| OpenSPP Type | Form.io Type | Description |
|-------------|-------------|-------------|
| `string` | `textfield` | Basic text input |
| `text` | `textarea` | Multi-line text |
| `number`, `integer`, `decimal` | `number` | Numeric input |
| `boolean` | `checkbox` | True/false checkbox |
| `date` | `datetime` | Date and time picker |
| `enum` | `select` | Dropdown selection |
| `admin_code` | `select` | Administrative code selection |
| `currency` | `currency` | Currency input with formatting |
| `phone` | `phoneNumber` | Phone number with input mask |
| `email` | `email` | Email with validation |

### Usage

1. Navigate to the Config Create page
2. In the "Import OpenSPP Specification" section, click "Select OpenSPP YAML File"
3. Choose your OpenSPP v7 specification file (.yaml or .yml)
4. The system will automatically populate:
   - Program metadata (name, description, version)
   - Entity forms based on OpenSPP entities
   - External sync configuration
5. Review any import warnings for unsupported features
6. Make manual adjustments as needed
7. Save the configuration

### Example OpenSPP YAML Structure

```yaml
program:
  id: "social-protection-program"
  name: "Social Protection Program"
  description: "A comprehensive social protection initiative"
  version: "1.0"

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

external_systems:
  - id: "education_system"
    role: "evidence_provider"
    interface:
      type: "rest_api"
```

### Limitations

- CEL expressions in derived fields are displayed as annotations but require manual implementation
- External sync URLs and authentication must be configured manually after import
- Complex business logic may need custom Form.io components
