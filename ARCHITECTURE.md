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

## Catalog configuration

Register each environment as a `Resource` entity with
`spec.type: kubernetes-cluster` and a `kyverno.io/endpoint` annotation pointing to
its Policy Reporter API base URL.

The entity-specific views find environments through the entity's `spec.dependsOn`
references. The overview pages discover matching cluster resources across the
catalog.

For the Kyverno entity view, `kyverno.io/namespace` and `kyverno.io/kind` set the
initial filters, and `kyverno.io/resource-name` supplies the search value.
The frontend falls back to `backstage.io/kubernetes-namespace` when the Kyverno
namespace annotation is absent.

See [README.md](README.md#step-4-define-kubernetes-clusters) for configuration
examples and [docs/component-setup.md](docs/component-setup.md) for view options.

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
to all environments; per-cluster credentials are not supported. Keep secrets in
backend configuration, not catalog annotations or frontend code.

The backend returns `404` for a missing catalog entity, `400` for a missing
endpoint annotation, `503` when it cannot reach Policy Reporter, and `502` when
Policy Reporter returns an unsuccessful HTTP response.
