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

<details>
  <summary><strong>PolicyReportsPage</strong> - Sidebar component used to display all policy reports for a given environment</summary>

## PolicyReportsPage

The `PolicyReportsPage` component displays all policy reports for a given environment. This component shows reports from all sources and is intended to be placed on the Backstage sidebar.

> **Note:** This component is a work in progress. See https://github.com/kyverno/backstage-policy-reporter-plugin/issues/29 for current state of the component

### Screenshot

![EntityCustomPoliciesContent](./assets/policy-reports-page.PNG)

### Setup Steps

Add a new Route element with the path `/policy-reports` and element of `<PolicyReportsPage>` in `packages/app/src/App.tsx`

```diff
+ import { PolicyReportsPage } from '@kyverno/backstage-plugin-policy-reporter';
...

const routes = (
  <FlatRoutes>
    {/* existing routes... */}

+    <Route
+      path='/policy-reports'
+      element={<PolicyReportsPage title='My Optional Title' />}
+    />
  </FlatRoutes>
);

```

Add a sidebar item that routes to the path setup in previous step

```diff
+import PolicyIcon from '@material-ui/icons/Policy';

export const Root = ({ children }: PropsWithChildren<{}>) => (
  <SidebarPage>
    <Sidebar>
      <SidebarLogo />
      {/* existing sidebar items... */}

      <SidebarScrollWrapper>
        {/* existing sidebar items... */}

+        <SidebarItem icon={PolicyIcon} to='policy-reports' text='Policy Reports' />
      </SidebarScrollWrapper>
    </Sidebar>
  </SidebarPage>
);


```

### Configuration Options

| Prop                   | Type   | Default                 | Description                                                                                                                      |
| ---------------------- | ------ | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| title                  | string | Policy Reports          | Optional Title to use for the content page                                                                                       |
| subtitle               | string | View all policy reports | Optional Subtitle to use for the content page                                                                                    |
| policyDocumentationUrl | string | undefined               | Optional URL used to generate links to policy documentation. [More information](/README.md#optional-custom-policy-documentation) |

</details>
