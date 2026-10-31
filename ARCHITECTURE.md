# Architecture

The plugin displays Policy Reporter results in Backstage. The browser calls the
Backstage backend, which resolves the selected cluster's endpoint from the catalog
and queries its Policy Reporter API. The plugin does not query Kubernetes directly
or evaluate policies.

## Request flow

```text
Backstage frontend --> Backstage backend --> Policy Reporter API
        |                     |
        +--> Catalog API      +--> Catalog service
             Find clusters         Resolve cluster endpoint
```

1. The frontend finds available environments in the Backstage catalog and lets
   the user select one. An environment represents a Kubernetes cluster resource.
2. The frontend uses Backstage discovery and fetch APIs through the shared
   generated client to call the `policy-reporter` backend. It sends the
   environment's entity reference, filters, and pagination.
3. The backend looks up that entity using its own service credentials and reads
   the `kyverno.io/endpoint` annotation.
4. The backend calls the selected Policy Reporter API with the query parameters
   and configured request headers, then returns the JSON results to the frontend.

The same flow serves policy results and filter options such as namespaces,
sources, and policies.

### Policy Reporter plugins

Policy Reporter plugins that are deployed as separate services, such as the
[VAP plugin](https://github.com/kyverno/policy-reporter-plugins/tree/main/plugins/vap)
and the
[Trivy plugin](https://github.com/kyverno/policy-reporter-plugins/tree/main/plugins/trivy),
follow the same flow with their own upstream:

```text
Backstage frontend --> Backstage backend --> Policy Reporter VAP plugin API
                              |
                              +--> Catalog service
                                   Resolve kyverno.io/plugin-vap-endpoint
```

- Every plugin implements the same upstream contract, so they share one backend
  service, `service/plugins/pluginPolicyService.ts`. A plugin is a descriptor in
  `service/plugins/descriptors.ts` holding its endpoint annotation, its request
  headers config key, and its display name — not a service of its own.
- Plugin routes are prefixed with the plugin name and mirror the upstream path,
  for example `/plugins/vap/v1/policies` proxies `<plugin-vap-endpoint>/v1/policies`.
- A plugin may serve several route groups behind one base URL: the Kyverno plugin
  serves `v1`, `vpol/v1` and `ivpol/v1`. The group is part of the mirrored path
  rather than a second annotation, so it is a parameter of the list call.
- Plugins follow the naming pattern `kyverno.io/plugin-<name>-endpoint` for the
  annotation and `policyReporter.plugins.<name>.requestHeaders` for headers.

| Plugin | Annotation                         | Route                        | Headers config                                |
| ------ | ---------------------------------- | ---------------------------- | --------------------------------------------- |
| VAP    | `kyverno.io/plugin-vap-endpoint`   | `/plugins/vap/v1/policies`   | `policyReporter.plugins.vap.requestHeaders`   |
| Trivy  | `kyverno.io/plugin-trivy-endpoint` | `/plugins/trivy/v1/policies` | `policyReporter.plugins.trivy.requestHeaders` |

## Catalog configuration

Register each environment as a `Resource` entity with
`spec.type: kubernetes-cluster` and a `kyverno.io/endpoint` annotation pointing to
its Policy Reporter API base URL.
Add a `kyverno.io/plugin-vap-endpoint` annotation pointing to the VAP plugin API
base URL to list the cluster on the Validating Admission Policies page, and a
`kyverno.io/plugin-trivy-endpoint` annotation pointing to the Trivy plugin API
base URL to list it for Trivy vulnerabilities.

The entity-specific views find environments through the entity's `spec.dependsOn`
references. The overview pages discover matching cluster resources across the
catalog.

For the Kyverno entity view, `kyverno.io/namespace` and `kyverno.io/kind` set the
initial filters, and `kyverno.io/resource-name` supplies the search value.
The frontend falls back to `backstage.io/kubernetes-namespace` when the Kyverno
namespace annotation is absent.

See the [frontend plugin README](plugins/policy-reporter/README.md#catalog-setup)
for configuration examples and the available extensions and components.

## Package responsibilities

| Package                                                          | Responsibility                                                                                                                                                                    |
| ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`policy-reporter`](plugins/policy-reporter/src)                 | UI, catalog discovery, environment selection, filters, and backend requests. The root entry point supports the legacy frontend system; `/alpha` supports the new frontend system. |
| [`policy-reporter-backend`](plugins/policy-reporter-backend/src) | API routes, catalog endpoint lookup, outbound requests, and error handling.                                                                                                       |
| [`policy-reporter-common`](plugins/policy-reporter-common/src)   | Shared annotations, types, and the generated API client.                                                                                                                          |

The API contract lives in
[`openapi.yaml`](plugins/policy-reporter-backend/src/schema/openapi.yaml).
Run `yarn generate` after changing it to regenerate the backend server types and
shared client. Both frontend integrations use this contract.

## Authentication and errors

The frontend uses Backstage's fetch API for backend requests. The backend uses
its own Backstage service credentials for catalog lookups, not for Policy
Reporter authentication.

Configure outbound Policy Reporter authentication headers through
`policyReporter.requestHeaders` in backend configuration. These headers apply
to all environments; per-cluster credentials are not supported. Each plugin's
headers are configured separately through
`policyReporter.plugins.<name>.requestHeaders` and are never sent to the Policy
Reporter API or to another plugin, and vice versa. Keep secrets in
backend configuration, not catalog annotations or frontend code.

The backend returns `404` for a missing catalog entity, `400` for a missing
endpoint annotation, `503` when it cannot reach Policy Reporter, and `502` when
Policy Reporter returns an unsuccessful HTTP response.
