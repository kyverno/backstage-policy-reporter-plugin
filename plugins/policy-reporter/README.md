# @kyverno/backstage-plugin-policy-reporter

The frontend for the Policy Reporter Backstage plugin. It shows
[Policy Reporter](https://kyverno.github.io/policy-reporter/) results in
Backstage: the policies that apply to a catalog entity, and an overview of every
policy result in a cluster.

![Policy Reporter page](https://raw.githubusercontent.com/kyverno/backstage-policy-reporter-plugin/main/plugins/policy-reporter/docs/images/policy-reports-page.png)

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Catalog setup](#catalog-setup)
  - [Register Kubernetes clusters](#register-kubernetes-clusters)
  - [Annotate entities](#annotate-entities)
- [New frontend system](#new-frontend-system)
  - [Extensions](#extensions)
  - [Configure extensions](#configure-extensions)
- [Validating Admission Policies](#validating-admission-policies)
- [Trivy Vulnerabilities](#trivy-vulnerabilities)
- [Legacy frontend system](#legacy-frontend-system)
  - [EntityKyvernoPoliciesContent](#entitykyvernopoliciescontent)
  - [EntityCustomPoliciesContent](#entitycustompoliciescontent)
  - [PolicyReportsPage](#policyreportspage)

## Prerequisites

- The [backend plugin](https://www.npmjs.com/package/@kyverno/backstage-plugin-policy-reporter-backend)
  is installed in your Backstage backend. The frontend sends every request
  through it.
- Your Backstage backend can reach a Policy Reporter API for each cluster.

## Installation

From your Backstage root directory, run:

```bash
yarn --cwd packages/app add @kyverno/backstage-plugin-policy-reporter
```

Then follow the setup for your frontend system: the
[new frontend system](#new-frontend-system) or the
[legacy frontend system](#legacy-frontend-system). Both use the same
[catalog setup](#catalog-setup).

## Catalog setup

### Register Kubernetes clusters

Register each cluster as a `Resource` entity with the type `kubernetes-cluster`.
Set the `kyverno.io/endpoint` annotation to the base URL of that cluster's
Policy Reporter API.

```yaml
apiVersion: backstage.io/v1alpha1
kind: Resource
metadata:
  name: aks-dev
  annotations:
    kyverno.io/endpoint: https://your-domain/policy-reporter/api/
spec:
  type: kubernetes-cluster
```

The URL for `kyverno.io/endpoint` depends on how Policy Reporter is exposed:

| Setup                                          | Endpoint                                                                       |
| ---------------------------------------------- | ------------------------------------------------------------------------------ |
| Policy Reporter UI v1                          | `https://your-domain/policy-reporter/api/`                                     |
| Policy Reporter UI v2                          | `https://your-domain/policy-reporter/proxy/default/core/`                      |
| Standalone Policy Reporter (no UI)             | The ingress URL of the Policy Reporter API, for example `https://your-domain/` |
| In-cluster service (Backstage in same cluster) | `http://policy-reporter.policy-reporter:8080/`                                 |

Standalone Policy Reporter needs an ingress for its API. You can enable one in
the Policy Reporter Helm chart.

Clusters without the `kyverno.io/endpoint` annotation do not appear in the
plugin. The overview pages list every cluster that has it.

### Annotate entities

To show policies on an entity, for example a `Component`, add these annotations
and a `dependsOn` reference to each cluster the entity runs in:

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: my-service
  annotations:
    kyverno.io/namespace: default
    kyverno.io/kind: Deployment,Pod
    kyverno.io/resource-name: my-service
spec:
  dependsOn:
    - resource:default/aks-dev
    - resource:default/aks-prd
```

| Annotation                 | Required | Description                                                                                                                                       |
| -------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kyverno.io/resource-name` | Yes      | Name of the Kubernetes resource(s) to show policy results for. Used as the initial search value.                                                  |
| `kyverno.io/namespace`     | No       | Namespace(s) of the resource, comma-separated (`default,kyverno`). If it is not set, the plugin uses `backstage.io/kubernetes-namespace` instead. |
| `kyverno.io/kind`          | No       | Kubernetes kind(s) of the resource, comma-separated (`Deployment,Pod`).                                                                           |

Each `dependsOn` entry that points to a `kubernetes-cluster` resource with a
`kyverno.io/endpoint` annotation becomes an environment the user can select.

## New frontend system

If your app uses feature discovery (`app.packages: all` in `app-config.yaml`),
installing the package is enough. Otherwise, add the plugin to your app:

```tsx
// packages/app/src/App.tsx
import { createApp } from '@backstage/frontend-defaults';
import policyReporterPlugin from '@kyverno/backstage-plugin-policy-reporter/alpha';

const app = createApp({
  features: [policyReporterPlugin],
});
```

![Policy Reporter entity content](https://raw.githubusercontent.com/kyverno/backstage-policy-reporter-plugin/main/plugins/policy-reporter/docs/images/entity-content-page.png)

### Extensions

| Extension ID                                             | Default  | Description                                                                                                                                                 |
| -------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `page:policy-reporter`                                   | Enabled  | Policy Reporter page at `/policy-reporter`.                                                                                                                 |
| `sub-page:policy-reporter/namespaced-policy`             | Enabled  | **Namespaced Policies** tab: results for namespaced resources in a cluster.                                                                                 |
| `sub-page:policy-reporter/cluster-policy`                | Enabled  | **Cluster Policies** tab: results for cluster-scoped resources in a cluster.                                                                                |
| `sub-page:policy-reporter/validating-admission-policies` | Disabled | **Validating Admission Policies** tab. See [Validating Admission Policies](#validating-admission-policies).                                                 |
| `sub-page:policy-reporter/trivy-vulnerabilities`         | Disabled | **Trivy Vulnerabilities** tab. See [Trivy Vulnerabilities](#trivy-vulnerabilities).                                                                         |
| `entity-content:policy-reporter/policy-reporter`         | Enabled  | **Policy Reporter** tab on entity pages, showing results from the `kyverno` source. Only shown for entities with the `kyverno.io/resource-name` annotation. |
| `api:policy-reporter`                                    | Enabled  | API client used by the extensions above.                                                                                                                    |

### Configure extensions

Enable or disable extensions in `app-config.yaml`:

```yaml
app:
  extensions:
    # Hide the entity tab
    - entity-content:policy-reporter/policy-reporter: false
    # Show the Validating Admission Policies tab
    - sub-page:policy-reporter/validating-admission-policies: true
```

## Validating Admission Policies

The Policy Reporter page can list a cluster's Kubernetes
ValidatingAdmissionPolicies (VAP) using the
[Policy Reporter VAP plugin](https://github.com/kyverno/policy-reporter-plugins/tree/main/plugins/vap).
The VAP plugin runs as its own service, so it is set up separately from Policy
Reporter. This page is only available in the
[new frontend system](#new-frontend-system).

![Validating Admission Policies](https://raw.githubusercontent.com/kyverno/backstage-policy-reporter-plugin/main/plugins/policy-reporter/docs/images/vap-sub-page.png)

1. Add the `kyverno.io/plugin-vap-endpoint` annotation, set to the base URL of
   the VAP plugin API, to each cluster that runs the plugin. Only clusters with
   this annotation appear on the tab. The `kyverno.io/endpoint` annotation does
   not affect this.

   ```yaml
   apiVersion: backstage.io/v1alpha1
   kind: Resource
   metadata:
     name: aks-dev
     annotations:
       kyverno.io/endpoint: https://your-domain/policy-reporter/api/
       kyverno.io/plugin-vap-endpoint: http://policy-reporter-vap.policy-reporter:8080/
   spec:
     type: kubernetes-cluster
   ```

2. Enable the tab in `app-config.yaml`:

   ```yaml
   app:
     extensions:
       - sub-page:policy-reporter/validating-admission-policies: true
   ```

3. If the VAP plugin API requires authentication, configure
   `policyReporter.plugins.vap.requestHeaders` in the
   [backend](https://github.com/kyverno/backstage-policy-reporter-plugin/tree/main/plugins/policy-reporter-backend#configuration).

## Trivy Vulnerabilities

The Policy Reporter page can list the vulnerabilities Trivy found in a cluster
using the
[Policy Reporter Trivy plugin](https://github.com/kyverno/policy-reporter-plugins/tree/main/plugins/trivy).
The Trivy plugin runs as its own service, so it is set up separately from Policy
Reporter. This page is only available in the
[new frontend system](#new-frontend-system).

The tab lists the whole cluster, sorted by severity, and is not scoped to an
entity: the plugin API returns a flat list with no resource or namespace to
filter on.

1. Add the `kyverno.io/plugin-trivy-endpoint` annotation, set to the base URL of
   the Trivy plugin API, to each cluster that runs the plugin. Only clusters with
   this annotation appear on the tab. The `kyverno.io/endpoint` annotation does
   not affect this.

   ```yaml
   apiVersion: backstage.io/v1alpha1
   kind: Resource
   metadata:
     name: aks-dev
     annotations:
       kyverno.io/endpoint: https://your-domain/policy-reporter/api/
       kyverno.io/plugin-trivy-endpoint: http://policy-reporter-trivy.policy-reporter:8080/
   spec:
     type: kubernetes-cluster
   ```

2. Enable the tab in `app-config.yaml`:

   ```yaml
   app:
     extensions:
       - sub-page:policy-reporter/trivy-vulnerabilities: true
   ```

3. If the Trivy plugin API requires authentication, configure
   `policyReporter.plugins.trivy.requestHeaders` in the
   [backend](https://github.com/kyverno/backstage-policy-reporter-plugin/tree/main/plugins/policy-reporter-backend#configuration).

## Legacy frontend system

The package root exports components for apps that use the legacy frontend
system.

### EntityKyvernoPoliciesContent

Shows policy results from the `kyverno` source for the current entity.

Add it to the entity page in `packages/app/src/components/catalog/EntityPage.tsx`:

```tsx
import { EntityKyvernoPoliciesContent } from '@kyverno/backstage-plugin-policy-reporter';

const serviceEntityPage = (
  <EntityLayout>
    {/* ... */}
    <EntityLayout.Route path="/kyverno" title="Kyverno Policies">
      <EntityKyvernoPoliciesContent />
    </EntityLayout.Route>
  </EntityLayout>
);
```

| Prop                          | Type     | Default     | Description                                                                     |
| ----------------------------- | -------- | ----------- | ------------------------------------------------------------------------------- |
| `annotationsDocumentationUrl` | `string` | `undefined` | URL for the **Read more** button shown when no cluster is found in `dependsOn`. |
| `policyDocumentationUrl`      | `string` | `undefined` | Base URL for policy links. Each policy links to `<url>#<policy-name>`.          |

### EntityCustomPoliciesContent

Shows policy results from the sources you choose for the current entity.

```tsx
import { EntityCustomPoliciesContent } from '@kyverno/backstage-plugin-policy-reporter';

const serviceEntityPage = (
  <EntityLayout>
    {/* ... */}
    <EntityLayout.Route path="/policies" title="Policies">
      <EntityCustomPoliciesContent
        title="Trivy Vulnerabilities"
        sources={['trivy']}
      />
    </EntityLayout.Route>
  </EntityLayout>
);
```

| Prop                          | Type       | Default     | Description                                                                     |
| ----------------------------- | ---------- | ----------- | ------------------------------------------------------------------------------- |
| `title`                       | `string`   | —           | **Required.** Title of the content.                                             |
| `sources`                     | `string[]` | —           | **Required.** Policy Reporter sources to show results for.                      |
| `annotationsDocumentationUrl` | `string`   | `undefined` | URL for the **Read more** button shown when no cluster is found in `dependsOn`. |
| `policyDocumentationUrl`      | `string`   | `undefined` | Base URL for policy links. Each policy links to `<url>#<policy-name>`.          |

Need a component for a specific source?
[Open an issue](https://github.com/kyverno/backstage-policy-reporter-plugin/issues/new).

### PolicyReportsPage

A standalone page with policy results from all sources for a selected cluster.

Add a route in `packages/app/src/App.tsx`:

```tsx
import { PolicyReportsPage } from '@kyverno/backstage-plugin-policy-reporter';

const routes = (
  <FlatRoutes>
    {/* ... */}
    <Route path="/policy-reports" element={<PolicyReportsPage />} />
  </FlatRoutes>
);
```

Then add a sidebar item in `packages/app/src/components/Root/Root.tsx`:

```tsx
import PolicyIcon from '@material-ui/icons/Policy';

<SidebarItem icon={PolicyIcon} to="policy-reports" text="Policy Reports" />;
```

| Prop                     | Type     | Default          | Description                                                            |
| ------------------------ | -------- | ---------------- | ---------------------------------------------------------------------- |
| `title`                  | `string` | `Policy Reports` | Page title.                                                            |
| `subtitle`               | `string` | `undefined`      | Page subtitle.                                                         |
| `policyDocumentationUrl` | `string` | `undefined`      | Base URL for policy links. Each policy links to `<url>#<policy-name>`. |
