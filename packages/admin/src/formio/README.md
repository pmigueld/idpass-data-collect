# Form.io Custom Components

The Admin Form Builder uses native Vue components to render the Form.io builder interface.

## Architecture

Custom Form.io components are registered in `src/formio/index.ts` and called during application startup in `main.ts`. This approach:

- Eliminates the need for iframe-based communication
- Provides better Vue integration and reactivity
- Allows TypeScript type checking for custom components
- Simplifies debugging and testing

## Adding Custom Components

To add a new custom component:

1. Create a new TypeScript file in `src/formio/components/` following the pattern of `BiometricCapture.ts`
2. Export the component from `src/formio/index.ts`
3. Register it in the `registerCustomComponents()` function

Example:

```typescript
// src/formio/components/MyCustomComponent.ts
import Formio from 'formiojs'

const Field = (Formio as any).Components.components.field

class MyCustomComponent extends Field {
  static schema(...extend: unknown[]) {
    return Field.schema({
      type: 'myCustomComponent',
      label: 'My Custom Component',
      key: 'myCustomComponent',
      // ... other schema properties
    }, ...extend)
  }

  static get builderInfo() {
    return {
      title: 'My Custom Component',
      group: 'advanced',
      icon: 'cog',
      weight: 0,
      schema: MyCustomComponent.schema()
    }
  }

  static editForm() {
    return {
      components: [
        // ... edit form configuration
      ]
    }
  }
}

export default MyCustomComponent
```

Then register it:

```typescript
// src/formio/index.ts
import MyCustomComponent from './components/MyCustomComponent'

export function registerCustomComponents(): void {
  const formio = Formio as unknown as FormioWithComponents
  if (formio?.Components?.addComponent) {
    formio.Components.addComponent('biometricCapture', BiometricCapture)
    formio.Components.addComponent('myCustomComponent', MyCustomComponent)
  }
}
```

## Runtime Components

The **Mobile** runtime components are defined in `packages/mobile/src/formio/components/` as they are part of the mobile Vue application bundle and require different functionality (e.g., actual biometric capture via device APIs).

## Legacy Files

The following files are kept for backward compatibility but are no longer used:

- `public/formio-builder.html` - Former iframe-based builder
- `public/biometric-component.js` - Former custom component for iframe

These can be removed once the migration is verified stable.
