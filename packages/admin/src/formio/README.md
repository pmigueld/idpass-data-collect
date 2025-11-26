# Form.io Custom Components

The Admin Form Builder uses the `@formio/vue` Builder component directly in Vue, replacing the previous iframe-based approach.

Custom components for the **builder** are defined in `src/formio/components/` as TypeScript modules and registered via `src/formio/index.ts`. The registration happens automatically when the app initializes in `main.ts`.

## Adding Custom Components

To add a new custom component to the Form.io builder:

1. Create a new component file in `src/formio/components/` (e.g., `MyCustomComponent.ts`)
2. Extend the Form.io Field class and implement the required methods
3. Register the component in `src/formio/index.ts` by calling `Formio.Components.addComponent()`

Example structure:
```typescript
import Formio from 'formiojs';
const Field = Formio.Components.components.field;

export default class MyCustomComponent extends Field {
  static schema(...extend) {
    return Field.schema({
      type: 'myCustom',
      // ... schema definition
    }, ...extend);
  }

  static get builderInfo() {
    return {
      title: 'My Custom Component',
      group: 'advanced',
      // ... builder info
    };
  }
}
```

The **Mobile** runtime components are defined in `packages/mobile/src/formio/components/` as they are part of the Vue application bundle.
