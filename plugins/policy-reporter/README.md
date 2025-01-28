# backstage-policy-reporter-plugin

The Frontend for the Policy Reporter plugin

This plugin integrates [Policy Reporter](https://kyverno.github.io/policy-reporter/) with Backstage to provide a clear and detailed view of Kyverno Policies applied to your entities

The [Backend](https://www.npmjs.com/package/@kyverno/backstage-plugin-policy-reporter-backend?activeTab=readme) plugin is required for this plugin to work

## Installation

Add the plugin to your frontend app

```bash
yarn --cwd packages/app add @kyverno/backstage-plugin-policy-reporter
```

Add the **EntityKyvernoPoliciesContent** component to the Entity routes in `packages/app/src/components/catalog/EntityPage.tsx`

```diff

+ import { EntityKyvernoPoliciesContent } from '@kyverno/backstage-plugin-policy-reporter';

const serviceEntityPage = (

  <EntityLayout>

    // ...

+    <EntityLayout.Route path="/kyverno" title="kyverno policy">
+      <EntityKyvernoPoliciesContent />
+    </EntityLayout.Route>

    // ..

  </EntityLayout>
)
```

## Configuration

### Define Kubernetes Clusters

In your Backstage instance, define your Kubernetes clusters using the `Resource` kind and `kubernetes-cluster` type. Add the `kyverno.io/endpoint` annotation with the URL to the Policy Reporter API for each cluster.

```yaml
apiVersion: backstage.io/v1alpha1
kind: Resource
metadata:
  name: aks-dev
  annotations:
    # Add the Policy Reporter API endpoint as an annotation
    kyverno.io/endpoint: http://kyverno.io/policy-reporter/api/
spec:
  type: kubernetes-cluster
```

### Annotate Services

To show the policies on the service, add a dependency to the Kubernetes cluster resource in the `catalog-info.yaml` file of your service. Ensure that the necessary annotations are added as well. For more details, refer to the [How to annotate services](../../README.md#how-to-annotate-services) section.

```yaml
metadata:
  annotations:
    kyverno.io/namespace: default # Specify the namespace of the service
    kyverno.io/kind: Deployment,Pod # Specify the kind(s) of the Kubernetes resource(s)
    kyverno.io/resource-name: policy-reporter # Specify the name of the resource
spec:
  dependsOn:
    # Add dependency to all environments the service is deployed to using the Resource entityRef
    - resource:default/aks-dev
    - resource:default/aks-tst
    - resource:default/aks-qa
    - resource:default/aks-prd
```

## Customization

To configure the plugin to make the policy Chip a link to custom documentation, follow the steps below.

To enable policy Chip links, the **EntityKyvernoPolicyReportsContent** component requires the **policyDocumentationUrl** prop to be set to the URL of the documentation.

```typescript
const serviceEntityPage = (
  <EntityLayout>
    // ...
    <EntityLayout.Route path="/kyverno" title="kyverno policy">
      <EntityKyvernoPoliciesContent policyDocumentationUrl="Your full URL link" />
    </EntityLayout.Route>
    // ..
  </EntityLayout>
);
```

The policy documentation file provided in the above step needs to follow a specific structure.

All policies being used should have a header that matches the exact same name as the policy. Under this header, you can add information about the policy and provide a guide on how to solve it.

The plugin will create a link using the following format: `<DocumentationUrl>#<PolicyName>`

See the [example/policy-documentation.md](../../example/policy-documentation.md) file for an example of how this could look.
