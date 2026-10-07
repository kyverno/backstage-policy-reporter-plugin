# AGENTS.md

## Project overview

See [ARCHITECTURE.md](ARCHITECTURE.md) for the request flow, catalog configuration,
and package responsibilities.

This repository is a Yarn workspaces monorepo for the Kyverno Policy Reporter
Backstage plugin. The published plugin code is under `plugins/`:

- `plugins/policy-reporter`: Backstage frontend plugin.
- `plugins/policy-reporter-backend`: Backstage backend plugin and its OpenAPI
  server implementation.
- `plugins/policy-reporter-common`: shared types, annotations, and generated
  OpenAPI client.

`packages/app` and `packages/backend` are a sample Backstage application using
the legacy frontend system. `packages/app-migrated` is an example using the new
frontend system. Workspace packages are declared in the root `package.json`.

## Environment and setup

- Use Node.js 22 or 24, as declared by the root `engines` field. CI currently
  uses Node.js 22.
- Use the repository-pinned Yarn 4.10.3 (`.yarnrc.yml`).
- Install dependencies from the repository root with `yarn install`.
- No environment file or database setup is required just to build or test.
  Running the local example against a cluster does require a reachable Policy
  Reporter API; see `DEVELOPMENT.md` for optional Kind, Kyverno, and Helm setup.

## Development commands

Run commands from the repository root:

| Purpose                                               | Command                   |
| ----------------------------------------------------- | ------------------------- |
| Start the default Backstage examples                  | `yarn start`              |
| Start the migrated app with the backend               | `yarn start:app-migrated` |
| Build all packages                                    | `yarn build:all`          |
| Build the backend plugin only                         | `yarn build:backend`      |
| Type-check                                            | `yarn tsc`                |
| Clean generated build output                          | `yarn clean`              |
| Generate the backend OpenAPI server and common client | `yarn generate`           |

Use `yarn start` for local development; the root `dev` script is only a
placeholder. The root package scripts and each workspace's `package.json` are
the source of truth for available tasks.

## Tests and checks

- Run the CI test suite without watch mode: `yarn test:all:no-watch`.
- Run tests with coverage: `yarn test:all`.
- Run end-to-end tests: `yarn test:e2e` (Playwright).
- Run TypeScript checks: `yarn tsc`.
- Build all packages: `yarn build:all`.
- Lint changed files relative to `origin/main`: `yarn lint`.
- Lint all files: `yarn lint:all`.
- Check formatting: `yarn prettier:check`.

Tests are colocated with implementation and use `*.test.ts` or `*.test.tsx`.
Frontend and backend package tests use the Backstage CLI test runner. Add or
update tests for behavior changes. The pull-request CI workflow runs
`yarn test:all:no-watch`, `yarn tsc`, and `yarn build:all`.

## Code conventions

- Follow existing TypeScript, React, and Backstage plugin patterns in the
  neighboring package. Frontend code is in `plugins/policy-reporter/src`;
  backend service and router code is in
  `plugins/policy-reporter-backend/src/service`.
- Keep shared plugin contracts and generated client types in
  `plugins/policy-reporter-common`.
- Tests should remain alongside the code they exercise.
- Use the repository Prettier configuration (`@backstage/cli/config/prettier`)
  and ESLint through the Backstage CLI. `yarn fix` applies repository fixes.
- The backend OpenAPI definition is
  `plugins/policy-reporter-backend/src/schema/openapi.yaml`. When changing it,
  regenerate its server and common client with `yarn generate`; avoid hand
  editing generated files under `schema/openapi/generated`.

## Release and pull requests

Follow [CONTRIBUTING.md](CONTRIBUTING.md), including the required DCO sign-off on
each commit (`git commit -s`).

Changes to publishable packages are released through Changesets. Add a
Changeset for user-visible changes to published packages. Before submitting,
run the CI checks listed above. Do not manually publish packages as part of
normal development.
