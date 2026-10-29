# @kyverno/backstage-plugin-policy-reporter-common

Shared code for the Policy Reporter Backstage plugin: the catalog annotation
constants, shared types, and the API client generated from the backend's
OpenAPI definition.

The [frontend](https://www.npmjs.com/package/@kyverno/backstage-plugin-policy-reporter)
and [backend](https://www.npmjs.com/package/@kyverno/backstage-plugin-policy-reporter-backend)
plugins already depend on this package, so you only need to install it yourself
to use these exports in your own code.

```bash
yarn add @kyverno/backstage-plugin-policy-reporter-common
```

## Annotations

| Constant                                 | Annotation                          | Set on             | Description                                                    |
| ---------------------------------------- | ----------------------------------- | ------------------ | -------------------------------------------------------------- |
| `KYVERNO_ENDPOINT_ANNOTATION`            | `kyverno.io/endpoint`               | Cluster `Resource` | Base URL of the cluster's Policy Reporter API.                 |
| `KYVERNO_PLUGIN_VAP_ENDPOINT_ANNOTATION` | `kyverno.io/plugin-vap-endpoint`    | Cluster `Resource` | Base URL of the cluster's Policy Reporter VAP plugin API.      |
| `KYVERNO_RESOURCE_NAME_ANNOTATION`       | `kyverno.io/resource-name`          | Entity             | Name of the Kubernetes resource(s) to show policy results for. |
| `KYVERNO_NAMESPACE_ANNOTATION`           | `kyverno.io/namespace`              | Entity             | Namespace(s) of the resource, comma-separated.                 |
| `KYVERNO_KIND_ANNOTATION`                | `kyverno.io/kind`                   | Entity             | Kubernetes kind(s) of the resource, comma-separated.           |
| `KUBERNETES_NAMESPACE_ANNOTATION`        | `backstage.io/kubernetes-namespace` | Entity             | Used for the namespace when `kyverno.io/namespace` is not set. |

See [Catalog setup](https://github.com/kyverno/backstage-policy-reporter-plugin/tree/main/plugins/policy-reporter#catalog-setup)
for how to use them.

## API client

`DefaultApiClient` is generated from the backend's
[OpenAPI definition](https://github.com/kyverno/backstage-policy-reporter-plugin/blob/main/plugins/policy-reporter-backend/src/schema/openapi.yaml).
It calls the `policy-reporter` backend plugin through Backstage's discovery and
fetch APIs:

```ts
import { DefaultApiClient } from '@kyverno/backstage-plugin-policy-reporter-common';

const client = new DefaultApiClient({ discoveryApi, fetchApi });
```
