# @kyverno/backstage-plugin-policy-reporter

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
