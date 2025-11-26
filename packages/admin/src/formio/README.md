# Form.io Custom Components

The Admin Form Builder uses a native Vue component (`FormioBuilder.vue`) that integrates Form.io builder directly into the Vue application.

Custom components for the **builder** are defined in `src/formio/components/` as TypeScript classes. These components are registered with Form.io when the application starts via `src/formio/index.ts`.

To add a new custom component to the builder:

1. Create a new TypeScript file in `src/formio/components/` (e.g., `MyCustomComponent.ts`)
2. Extend Form.io's Field component and implement the required methods:
   - `static schema()` - Define the component schema
   - `static get builderInfo()` - Provide builder metadata (title, group, icon, etc.)
   - `static editForm()` - Define the settings form for the builder (optional)
3. Register the component in `src/formio/index.ts` by calling `Formio.Components.addComponent()`

The **Mobile** runtime components are defined in `packages/mobile/src/formio/components/` as they are part of the Vue application bundle. Note that builder components and runtime components may have different implementations since they serve different purposes.
