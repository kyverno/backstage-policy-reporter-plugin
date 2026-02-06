# @kyverno/backstage-plugin-policy-reporter

## 2.6.0

### Minor Changes

- 93bf028: Added namespace filtering to the `PolicyReportsPage`. Users can now filter the list of policy reports by selecting one or more namespaces from the selected cluster.

### Patch Changes

- Updated dependencies [93bf028]
  - @kyverno/backstage-plugin-policy-reporter-common@2.2.0

## 2.5.0

### Minor Changes

- 44376bd: Add support for the `backstage.io/kubernetes-namespace` annotation as an alternative for the `kyverno.io/namespace`. This is useful for anyone already using the Kubernetes plugin. The kyverno namespaced annotation will always be the first priority.

  Add `isPolicyReporterAvailable` helper function to validate if PolicyReporter is configured for an entity.

- ee217ed: Update to Backstage versions 1.43.0
- e713e1f: Migrate to OpenAPI-generated ApiClient, typed Express router, and common types instead of manual definitions.

  **BREAKING:** The backend endpoint now accepts environment entity as a query parameter instead of a path parameter.

  Frontend and backend must be updated simultaneously to maintain compatibility.

### Patch Changes

- Updated dependencies [44376bd]
- Updated dependencies [ee217ed]
- Updated dependencies [e713e1f]
  - @kyverno/backstage-plugin-policy-reporter-common@2.1.0

## 2.4.1

### Patch Changes

- 3390a1d: Add missing environment component to the `PolicyReportsPage`, which is now shown when no `kubernetes-cluster` Resources with the `kyverno.io/endpoint` annotation are defined.

## 2.4.0

### Minor Changes

- 0d6cf4b: Add Status and Severity filter to `PolicyReportsPage` component and updates the UI to now be 1 big table that by default show all failing policies

### Patch Changes

- 0d6cf4b: Update the `PolicyReportsPage` component's exported name to match the documentation. It was previously set to `PolicyReporterPage` by mistake and has now been corrected to `PolicyReportsPage`.

## 2.3.0

### Minor Changes

- 274db4d: Add initial implemenation for the `PolicyReportsPage` component that can be used for a more global overview of all policy reports for a given kubernetes cluster.

  Existing Entity components previously included a search bar on all tables, but it only supported searching within the already displayed policy reports. This version removes the search bar to avoid confusion and improve clarity.

## 2.2.4

### Patch Changes

- 00159f4: New release to validate updated publishing workflow
- Updated dependencies [00159f4]
  - @kyverno/backstage-plugin-policy-reporter-common@2.0.7

## 2.2.3

### Patch Changes

- ac24f2a: New release to validate updated publishing workflow
- Updated dependencies [ac24f2a]
  - @kyverno/backstage-plugin-policy-reporter-common@2.0.6

## 2.2.2

### Patch Changes

- 81cdccf: New release to validate updated publishing workflow
- Updated dependencies [81cdccf]
  - @kyverno/backstage-plugin-policy-reporter-common@2.0.5

## 2.2.1

### Patch Changes

- 2f2c362: Replaced workspace:^ with a fixed version of `@kyverno/backstage-plugin-policy-reporter-common` in `package.json` to avoid issues when publishing.
- 2f2c362: The Yarn Backstage plugin has been temporarily disabled due to issues with `backstage:^` not being replaced correctly during publishing with Changesets.
- b8c72e7: Update plugins to use Backstage v1.38.1
- Updated dependencies [2f2c362]
- Updated dependencies [b8c72e7]
  - @kyverno/backstage-plugin-policy-reporter-common@2.0.4

## 2.2.0

### Minor Changes

- 3722ec7: Add `EntityCustomPoliciesContent` component that can be used to view policies from custom sources
