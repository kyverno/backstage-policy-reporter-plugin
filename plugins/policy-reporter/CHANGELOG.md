# @kyverno/backstage-plugin-policy-reporter

## 2.10.0

### Minor Changes

- 880eecc: Backstage version bump to v1.51.1

### Patch Changes

- Updated dependencies [880eecc]
  - @kyverno/backstage-plugin-policy-reporter-common@2.5.0

## 2.9.0

### Minor Changes

- 836f939: Add `FilterLayout` component with responsive sidebar filters. On large screens filters render as a sidebar, on smaller screens they collapse into a dialog triggered by a filter icon button. Updated `EntityCustomPoliciesContent`, `EntityKyvernoPoliciesContent`, and `PolicyReportsPage` to use the new layout.

## 2.8.0

### Minor Changes

- d9f5bd3: Filter state (search, namespace, severity, and status) is now managed via URL query params, making filter selections shareable and persistent across page refreshes.
- ba911d8: Entity content pages (`EntityKyvernoPoliciesContent`, `EntityCustomPoliciesContent`) now show filters for status and severity, consistent with the `PolicyReportsPage`.
- d058bc7: Migrated several components to the new Backstage UI (BUI) components, replacing legacy MUI-based implementations:

  - `PolicyReportsPage`, `EntityKyvernoPoliciesContent`, and `EntityCustomPoliciesContent` now use BUI `Grid`, `Container`, and `HeaderPage` for layout.
  - Filter selectors (`SelectEnvironment`, `SelectNamespace`, `SelectSeverity`, `SelectStatus`) now use the BUI `Select` component.
  - Severity badges now use the BUI `Tag` and `TagGroup` components instead of MUI chips.

- be6bff2: Entity content pages (`EntityKyvernoPoliciesContent`, `EntityCustomPoliciesContent`) now display a single unified table instead of separate tables for failing/passing/skipped policies, aligning with the `PolicyReportsPage`.

  Search state is now managed via URL query params, making search results shareable and persistent across page refreshes.

  Migrated table component to the new Backstage UI (BUI) components.

- e0e8462: Backstage verion bump to v1.50.4

### Patch Changes

- Updated dependencies [e0e8462]
  - @kyverno/backstage-plugin-policy-reporter-common@2.4.0

## 2.7.0

### Minor Changes

- 4b09f8c: Backstage verion bump to v1.48.5
- c4e5ae4: Add initial support for the new Frontend System, this will be available under a `/alpha` route when importing packages.

### Patch Changes

- Updated dependencies [4b09f8c]
  - @kyverno/backstage-plugin-policy-reporter-common@2.3.0

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
