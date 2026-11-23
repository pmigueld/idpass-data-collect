# Form.io Builder (Vue)

The Admin Form Builder is the in-app Vue component `src/components/FormioBuilder.vue`
(migrated from the legacy `public/formio-builder.html` iframe).

## Styling

`loadBuilderAssets.ts` is the single styling entry point, imported by the
builder component. It bundles (no CDN):

- `@formio/js/dist/formio.full.min.css` — Form.io's own builder/dialog styles
  (prefixed selectors, loaded globally).
- `font-awesome` (npm) — glyphs for markup that still uses `.fa`. Form.io 5's
  palette uses Bootstrap Icons, shipped with `formio.full.min.css`.
- `builder-theme.scss` — Bootstrap 5 compiled from SCSS with its variables
  mapped to the ID PASS design tokens, **scoped** under
  `.formio-builder-host`, `.formio-renderer-host`, and `.formio-dialog` so it
  cannot leak into the Vuetify dashboard, plus the ID PASS builder chrome
  (sidebar chips, drop zone, tabs, drag ghost). Bootstrap's `:root` color
  tokens are global (`--bs-*`) because nesting them under the host never
  matches; they do not collide with Vuetify's `--v-*` tokens.

Token values are duplicated as SCSS hex (SCSS cannot read CSS custom
properties at compile time). Source of truth: `src/assets/design-tokens.css`
— keep `builder-theme.scss` in sync when the brand changes.

## Custom components

- **Builder-side** components (`biometricCapture`, `claim169Scanner`) are
  defined in `builderComponents.ts` and registered via
  `registerBuilderComponents()`, which `FormioBuilder.vue` calls before
  `Formio.builder(...)`. They are builder-only definitions (schema +
  `builderInfo` palette entry + `editForm` settings); the admin never captures,
  so the default Field render is used. This replaces the legacy global
  `public/biometric-component.js` loaded by the removed builder iframe.
- **Mobile runtime** components live in `packages/mobile/src/formio/components/`
  (`BiometricCapture.ts`, `Claim169Scanner.ts`) — they implement the actual
  capture/scan behaviour. Both sides register against the same `@formio/js`
  v5 component registry (mobile via `@formio/vue` 6). The definitions stay
  separate because the admin builder only needs schema, palette, and settings,
  while mobile implements capture and scan.
