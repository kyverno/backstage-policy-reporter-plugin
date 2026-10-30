# Local development

## Requirements

- Node.js 22 or 24
- Yarn 4 (the repository pins the version in `.yarnrc.yml`)
- For real policy data: Docker, [Kind](https://kind.sigs.k8s.io/),
  `kubectl`, and [Helm](https://helm.sh/)

## Install and start

```bash
yarn install
yarn start
```

This starts the example Backstage app (`packages/app`, legacy frontend system) on
<http://localhost:3000> and the backend (`packages/backend`) on
<http://localhost:7007>.

To work on the new frontend system, start the migrated app instead:

```bash
yarn start:app-migrated
```

## Frontend only, with no backend

For screenshots and for reviewing frontend changes, the frontend plugin runs on
its own against fixture data — no backend, no cluster, no network:

```bash
yarn workspace @kyverno/backstage-plugin-policy-reporter start
```

This serves the plugin on <http://localhost:3000>:

| Page                                         | Shows                                                                                                                     |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `/policy-reporter`                           | The standalone page and all three sub-page tabs, including Validating Admission Policies, which the plugin ships disabled |
| `/catalog/default/component/policy-reporter` | The entity page, with its real header and tab bar, and the Policy Reporter tab                                            |

Two fake clusters are offered in the plugin's own **Environment** dropdown:

| Environment | Shows                                                      |
| ----------- | ---------------------------------------------------------- |
| `dev`       | Populated results and VAP policies                         |
| `empty`     | The empty states, with every endpoint returning no results |

The fixtures live in `plugins/policy-reporter/dev/mock`. `fixtures.ts` holds the
data and `fetch.ts` maps it onto the API's routes; it is wired up in
`dev/devApis.ts`, which swaps the API client's `fetch` rather than the client
itself, so the generated request building still runs. A request to a route with
no handler answers 404 rather than looking like no data, so a new endpoint shows
up as a visible failure.

The catalog is served by Backstage's own `InMemoryCatalogClient`, so the entity
page works without a catalog backend. `@backstage/plugin-catalog` is installed as
a dev dependency purely so that page exists to attach the tab to — the plugin
itself does not depend on it.

This dev app is only for working locally. It is not a test fixture and nothing in
CI depends on it. For real policy data, use a cluster as described below.

## Example catalog

The example apps load their entities from `catalog/entities.yaml`:

| Entity                      | Purpose                                                                                        |
| --------------------------- | ---------------------------------------------------------------------------------------------- |
| `resource:dev`              | Cluster with `kyverno.io/endpoint: http://localhost:8080/` and the VAP endpoint on port 8081.  |
| `resource:test`             | Cluster with `kyverno.io/endpoint: http://localhost:8080/`.                                    |
| `component:policy-reporter` | Entity annotated for the `kyverno-background-controller` resources in the `kyverno` namespace. |

Change the endpoints or entity annotations there to match your cluster.

## Run Policy Reporter locally

You need a Policy Reporter API with some policy reports for the plugin to show
data. One way to get one is with Kind:

1. Create a cluster:

   ```bash
   kind create cluster -n kyverno
   ```

   If pods fail with "too many open files", increase the
   [inotify limits](https://kind.sigs.k8s.io/docs/user/known-issues/#pod-errors-due-to-too-many-open-files).

2. Add the Helm repositories:

   ```bash
   helm repo add kyverno https://kyverno.github.io/kyverno/
   helm repo add policy-reporter https://kyverno.github.io/policy-reporter
   helm repo update
   ```

3. Install Kyverno and the Pod Security Standard policies, which create policy
   reports:

   ```bash
   helm upgrade --install kyverno kyverno/kyverno -n kyverno --create-namespace
   helm upgrade --install kyverno-policies kyverno/kyverno-policies -n kyverno --set podSecurityStandard=restricted
   ```

4. Install Policy Reporter and forward its API to `localhost:8080`:

   ```bash
   helm upgrade --install policy-reporter policy-reporter/policy-reporter -n policy-reporter --create-namespace
   kubectl port-forward service/policy-reporter 8080:8080 -n policy-reporter
   ```

### Optional: Policy Reporter VAP plugin

To work on the Validating Admission Policies tab, deploy the
[Policy Reporter VAP plugin](https://github.com/kyverno/policy-reporter-plugins/tree/main/plugins/vap)
and forward its API to `localhost:8081`. Then enable the tab in
`app-config.yaml` (the line is already there, commented out) and run
`yarn start:app-migrated`.

To test request headers, uncomment the `policyReporter` block in
`app-config.yaml`.

## Dev Container

The repository includes a [Dev Container](https://containers.dev/) in
`.devcontainer/`. Open the repository in VS Code (or another editor that
supports Dev Containers) and run **Dev Containers: Reopen in Container**.

## Checks and releases

See [CONTRIBUTING.md](CONTRIBUTING.md) for the checks to run before opening a
pull request and for how releases work with changesets.
