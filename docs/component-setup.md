# Component Setup Guide

<details>
  <summary><strong>EntityKyvernoPoliciesContent</strong> - Displays kyverno policies for an entity</summary>

## EntityKyvernoPoliciesContent

The `EntityKyvernoPoliciesContent` component displays kyverno policies for an entity using the `kyverno` source

### Screenshot

![EntityKyvernoPoliciesContent](./assets/screenshot.PNG)

### Setup Steps

Add the `EntityKyvernoPoliciesContent` component to the Entity routes in `packages/app/src/components/catalog/EntityPage.tsx`

```diff
+ import { EntityKyvernoPoliciesContent } from '@kyverno/backstage-plugin-policy-reporter';

const serviceEntityPage = (
  <EntityLayout>
    {/* ... existing routes ... */}
+    <EntityLayout.Route path="/kyverno" title="kyverno policy">
+      <EntityKyvernoPoliciesContent />
+    </EntityLayout.Route>
    {/* ... */}
  </EntityLayout>
)
```

### Configuration Options

| Prop                        | Type   | Default   | Description                                                                                                                      |
| --------------------------- | ------ | --------- | -------------------------------------------------------------------------------------------------------------------------------- |
| annotationsDocumentationUrl | string | undefined | Optional URL used for the READ MORE button when annotations are missing                                                          |
| policyDocumentationUrl      | string | undefined | Optional URL used to generate links to policy documentation. [More information](/README.md#optional-custom-policy-documentation) |

</details>

<details>
  <summary><strong>EntityCustomPoliciesContent</strong> - Displays policy reports for an entity with a custom source</summary>

## EntityCustomPoliciesContent

The `EntityCustomPoliciesContent` component displays policy reports from a custom source.

This plugin aims to provide specialized components for different policy sources. If you need a component for a specific policy source that isn't currently available, please [open an issue](https://github.com/kyverno/backstage-policy-reporter-plugin/issues/new) with details about your use case.

New source-specific components are being developed based on user needs.

### Screenshot

![EntityCustomPoliciesContent](./assets/screenshot.PNG)

### Setup Steps

Add the `EntityCustomPoliciesContent` component to the Entity routes in `packages/app/src/components/catalog/EntityPage.tsx`

```diff
+ import { EntityCustomPoliciesContent } from '@kyverno/backstage-plugin-policy-reporter';

const serviceEntityPage = (
  <EntityLayout>
    {/* ... existing routes ... */}
+    <EntityLayout.Route path="/kyverno" title="kyverno policy">
+      <EntityCustomPoliciesContent title="Kyverno Policy Reports" sources={['kyverno']} />
+    </EntityLayout.Route>
    {/* ... */}
  </EntityLayout>
)
```

### Configuration Options

| Prop                        | Type     | Default   | Description                                                                                                                      |
| --------------------------- | -------- | --------- | -------------------------------------------------------------------------------------------------------------------------------- |
| title                       | string   | undefined | Required Title to use for the content page                                                                                       |
| sources                     | string[] | undefined | Required Array of all the sources to component should show policies for                                                          |
| annotationsDocumentationUrl | string   | undefined | Optional URL used for the READ MORE button when annotations are missing                                                          |
| policyDocumentationUrl      | string   | undefined | Optional URL used to generate links to policy documentation. [More information](/README.md#optional-custom-policy-documentation) |

</details>
