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

Each plugin can also run on its own through its `dev/` folder, for example
`yarn workspace @kyverno/backstage-plugin-policy-reporter start`.

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
