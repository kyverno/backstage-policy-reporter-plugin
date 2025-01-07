# Setting Up Local Development

## Requirements

- Node.js: This project requires Node.js version 18 or 20 to run.
- Yarn: This project uses Yarn version 4 for package management.
- Policy Reporter: Ensure you have a Policy Reporter instance running. The plugin is configured to query `http://localhost:8080/api/policy-reporter`.

## Step 1: Install Dependencies

Before starting local development, install the necessary dependencies using Yarn.

```sh
yarn install
```

## Step 2: Start Local Development

To start local development, use the `yarn dev` command. This command starts the local development server using the `dev` folders inside the `kyverno-policy-reports` and `kyverno-policy-reports-backend` directories.

```sh
yarn dev
```

## Optional: Setting Up Local Development Using Dev Containers

Dev Containers provide a fully configured development environment that contains everything needed to start development.

1. Install Docker: Dev Containers require Docker.
2. Install [VSCode](https://code.visualstudio.com/download). JetBrains IDEs also support Dev Containers.
3. Install the [Remote - Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers).
4. Open the project in VSCode and run the command `Remote-Containers: Reopen in Container`. This will start the Dev Container process.

## Policy Reporter Configuration

Ensure that your Policy Reporter instance is running and accessible at `http://localhost:8080/api/policy-reporter`. You can adjust the configuration if your Policy Reporter instance is running on a different host or port.

To change the endpoint used by the plugin locally, update the `endpoint` annotation in the `catalog/entities.yaml` file to the desired endpoint.

Depending on what policies are present in your Policy Reporter instance, you might need to change the mock entity annotations used during `yarn dev` that define the policies to display.

To update the mock entity annotations, modify the annotations in the `plugins/kyverno-policy-reports/dev/index.ts` file to match the policies available in your Policy Reporter instance.
