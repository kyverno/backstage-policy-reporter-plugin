# Contributing

We welcome bug fixes, features, and documentation improvements. Follow the
[Kyverno Code of Conduct](https://github.com/kyverno/community/blob/main/CODE_OF_CONDUCT.md).
For larger changes, open an issue to discuss your approach before starting.

## Local development

Fork and clone the repository, then use Node.js 22 or 24 and the repository-pinned
Yarn 4. Run these commands from the repository root:

```sh
yarn install
yarn start
```

Use `yarn start:app-migrated` to work with the new Backstage frontend system.
See [DEVELOPMENT.md](DEVELOPMENT.md) for local Policy Reporter setup and
[AGENTS.md](AGENTS.md) for the package layout and additional commands.

## Pull requests

Keep changes focused. Explain the problem and your solution, link related issues,
and describe how you tested the change. Add tests for behavior changes and update
affected documentation. Include screenshots for UI changes.

Follow the existing code style. Before submitting code changes, run:

```sh
yarn test:all:no-watch
yarn tsc
yarn build:all
yarn lint:all
yarn prettier:check
```

For documentation-only changes, check formatting with
`yarn prettier --check <changed-file>`. You are responsible for understanding and
checking all code you submit, including code written with AI assistance.

## DCO sign-off

We require a [Developer Certificate of Origin (DCO)](https://developercertificate.org/)
sign-off on each commit, including documentation changes. By signing off, you
certify that you have the right to submit the contribution.

Use your Git name and email to add the sign-off:

```sh
git commit -s -m "Describe your change"
```

Your commit message must include:

```text
Signed-off-by: Your Name <your.email@example.com>
```

This is a commit-message trailer, not a GPG signature. To add a missing sign-off
to your most recent commit, run `git commit --amend --no-edit --signoff`.

## Changesets

Include a changeset when your change affects a published plugin package under
`plugins/`. Root documentation, test-only changes, and the private example apps
do not need a changeset.

```sh
yarn changeset
```

Select the affected published packages and choose the version bump:

- **Patch**: bug fixes and other backward-compatible corrections.
- **Minor**: new backward-compatible features.
- **Major**: breaking changes.

Write a short summary of the user-facing change. For breaking changes, mark the
summary **BREAKING** and explain how users should migrate. Commit the generated
`.changeset/*.md` file with your PR.

Do not bump package versions or edit changelogs by hand. Maintainers use the
Changesets release workflow to prepare versions, changelogs, and npm releases.
