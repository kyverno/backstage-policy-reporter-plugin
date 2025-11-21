# @kyverno/backstage-plugin-policy-reporter-backend

## 2.2.0

### Minor Changes

- ee217ed: Update to Backstage versions 1.43.0
- e713e1f: Migrate to OpenAPI-generated ApiClient, typed Express router, and common types instead of manual definitions.

  **BREAKING:** The backend endpoint now accepts environment entity as a query parameter instead of a path parameter.

  Frontend and backend must be updated simultaneously to maintain compatibility.

### Patch Changes

- Updated dependencies [44376bd]
- Updated dependencies [ee217ed]
- Updated dependencies [e713e1f]
  - @kyverno/backstage-plugin-policy-reporter-common@2.1.0

## 2.1.4

### Patch Changes

- 00159f4: New release to validate updated publishing workflow
- Updated dependencies [00159f4]
  - @kyverno/backstage-plugin-policy-reporter-common@2.0.7

## 2.1.3

### Patch Changes

- ac24f2a: New release to validate updated publishing workflow
- Updated dependencies [ac24f2a]
  - @kyverno/backstage-plugin-policy-reporter-common@2.0.6

## 2.1.2

### Patch Changes

- 81cdccf: New release to validate updated publishing workflow
- Updated dependencies [81cdccf]
  - @kyverno/backstage-plugin-policy-reporter-common@2.0.5

## 2.1.1

### Patch Changes

- 2f2c362: Replaced workspace:^ with a fixed version of `@kyverno/backstage-plugin-policy-reporter-common` in `package.json` to avoid issues when publishing.
- 2f2c362: The Yarn Backstage plugin has been temporarily disabled due to issues with `backstage:^` not being replaced correctly during publishing with Changesets.
- b8c72e7: Update plugins to use Backstage v1.38.1
- Updated dependencies [2f2c362]
- Updated dependencies [b8c72e7]
  - @kyverno/backstage-plugin-policy-reporter-common@2.0.4
