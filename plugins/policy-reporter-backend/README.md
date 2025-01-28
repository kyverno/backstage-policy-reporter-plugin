# backstage-policy-reporter-plugin-backend

The Backend for the Policy Reporter plugin

This plugin integrates [Policy Reporter](https://kyverno.github.io/policy-reporter/) with Backstage to provide a clear and detailed view of Kyverno Policies applied to your entities

## Installation

From your backstage root directory, run the following commands:

```bash
yarn --cwd packages/backend add @kyverno/backstage-plugin-policy-reporter-backend
```

Then add the plugin to your backend in `packages/backend/src/index.ts`

```diff

const backend = createBackend();

// ..
+backend.add(import('@kyverno/backstage-plugin-policy-reporter-backend'));
// ..

backend.start();

```
