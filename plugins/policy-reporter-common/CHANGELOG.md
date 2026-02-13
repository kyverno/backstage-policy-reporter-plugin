# @kyverno/backstage-plugin-policy-reporter-common

## 2.2.0

### Minor Changes

- 93bf028: Added namespace filtering to the `PolicyReportsPage`. Users can now filter the list of policy reports by selecting one or more namespaces from the selected cluster.

## 2.1.0

### Minor Changes

- 44376bd: Add support for the `backstage.io/kubernetes-namespace` annotation as an alternative for the `kyverno.io/namespace`. This is useful for anyone already using the Kubernetes plugin. The kyverno namespaced annotation will always be the first priority.

  Add `isPolicyReporterAvailable` helper function to validate if PolicyReporter is configured for an entity.

- ee217ed: Update to Backstage versions 1.43.0
- e713e1f: Migrate to OpenAPI-generated ApiClient, typed Express router, and common types instead of manual definitions.

  **BREAKING:** The backend endpoint now accepts environment entity as a query parameter instead of a path parameter.

  Frontend and backend must be updated simultaneously to maintain compatibility.

## 2.0.7

### Patch Changes

- 00159f4: New release to validate updated publishing workflow

## 2.0.6

### Patch Changes

- ac24f2a: New release to validate updated publishing workflow

## 2.0.5

### Patch Changes

- 81cdccf: New release to validate updated publishing workflow

## 2.0.4

### Patch Changes

- 2f2c362: The Yarn Backstage plugin has been temporarily disabled due to issues with `backstage:^` not being replaced correctly during publishing with Changesets.
- b8c72e7: Update plugins to use Backstage v1.38.1
