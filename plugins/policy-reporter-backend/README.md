# @kyverno/backstage-plugin-policy-reporter-backend

The backend for the Policy Reporter Backstage plugin. It sits between the
[frontend plugin](https://www.npmjs.com/package/@kyverno/backstage-plugin-policy-reporter)
and [Policy Reporter](https://kyverno.github.io/policy-reporter/). For each
request it looks up the selected cluster in the catalog, reads the cluster's
endpoint annotation, and forwards the query to that cluster's Policy Reporter API.

## Installation

From your Backstage root directory, run:

```bash
yarn --cwd packages/backend add @kyverno/backstage-plugin-policy-reporter-backend
```

Add the plugin to your backend in `packages/backend/src/index.ts`:

```ts
const backend = createBackend();

// ...
backend.add(import('@kyverno/backstage-plugin-policy-reporter-backend'));

backend.start();
```

The backend reads cluster endpoints from the catalog, so each cluster must be
registered as a `kubernetes-cluster` resource. See
[Catalog setup](https://github.com/kyverno/backstage-policy-reporter-plugin/tree/main/plugins/policy-reporter#catalog-setup).

## Configuration

All configuration is optional.

| Key                                           | Type                     | Description                                                                                                  |
| --------------------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------ |
| `policyReporter.requestHeaders`               | `Record<string, string>` | Headers sent with every request to every Policy Reporter API, for example to authenticate through a gateway. |
| `policyReporter.plugins.vap.requestHeaders`   | `Record<string, string>` | Headers sent with every request to every Policy Reporter VAP plugin API, for example basic auth.             |
| `policyReporter.plugins.trivy.requestHeaders` | `Record<string, string>` | Headers sent with every request to every Policy Reporter Trivy plugin API, for example basic auth.           |

```yaml
# app-config.yaml
policyReporter:
  requestHeaders:
    Authorization: Bearer ${POLICY_REPORTER_API_TOKEN}
  plugins:
    vap:
      requestHeaders:
        Authorization: Basic ${POLICY_REPORTER_VAP_BASIC_AUTH}
    trivy:
      requestHeaders:
        Authorization: Basic ${POLICY_REPORTER_TRIVY_BASIC_AUTH}
```

Each set of headers only goes to its own API. Headers in
`policyReporter.requestHeaders` are never sent to a plugin, a plugin's headers
are never sent to Policy Reporter, and no plugin receives another plugin's
headers.

> [!NOTE]
> The same headers are used for every cluster. Per-cluster credentials are not
> supported.

## Policy Reporter plugins

Policy Reporter plugins are deployed separately from Policy Reporter, so each one
has its own cluster annotation, route, and headers configuration. Every route
mirrors the upstream plugin path: `/plugins/trivy/v1/policies` proxies
`<plugin-trivy-endpoint>/v1/policies`.

| Plugin | Cluster annotation                 | Route                            | Headers config                                |
| ------ | ---------------------------------- | -------------------------------- | --------------------------------------------- |
| VAP    | `kyverno.io/plugin-vap-endpoint`   | `GET /plugins/vap/v1/policies`   | `policyReporter.plugins.vap.requestHeaders`   |
| Trivy  | `kyverno.io/plugin-trivy-endpoint` | `GET /plugins/trivy/v1/policies` | `policyReporter.plugins.trivy.requestHeaders` |

## Errors

| Status | Cause                                                                                                                                |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| `400`  | The cluster entity has no `kyverno.io/endpoint` (or the `kyverno.io/plugin-<name>-endpoint` annotation of the plugin being queried). |
| `404`  | The cluster entity does not exist in the catalog.                                                                                    |
| `502`  | Policy Reporter returned an unsuccessful response.                                                                                   |
| `503`  | The backend could not reach Policy Reporter.                                                                                         |

The API is defined in
[`openapi.yaml`](https://github.com/kyverno/backstage-policy-reporter-plugin/blob/main/plugins/policy-reporter-backend/src/schema/openapi.yaml).
