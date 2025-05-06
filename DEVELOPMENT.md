# Setting Up Local Development

## Requirements

- Node.js: This project requires Node.js version 18 or 20 to run.
- Yarn: This project uses Yarn version 4 for package management.
- Kind: This project uses Kind to run a local Kubernetes cluster.
- Kubectl: This project uses Kubectl to interact with the Kubernetes cluster.
- Policy Reporter: Ensure you have a Policy Reporter instance running. The plugin is configured to query `http://localhost:8080/api/policy-reporter`.

## Step 1: Install Dependencies

Before starting local development, install the necessary dependencies using Yarn.

```sh
yarn install
```

## Step 2: Start Local Development

Prerequired Steps (without existing Cluster)

1. Create a local cluster (e.g. with Kind or Minikube)

```bash
kind create cluster -n kyverno
```

NOTE: if you get error on [too many open files](https://kind.sigs.k8s.io/docs/user/known-issues/#pod-errors-due-to-too-many-open-files) you need to increase the inotify limits.

2. Install Kyverno + Kyverno PSS Policies

Kyverno installs the required CRDS and you get some sample PolicyReports by installing the PSS policies.

Add Helm chart

```bash
helm repo add kyverno https://kyverno.github.io/kyverno/
helm repo add policy-reporter https://kyverno.github.io/policy-reporter
helm repo update
```

install Kyverno + CRDs

```bash
helm upgrade --install kyverno kyverno/kyverno -n kyverno --create-namespace
```

Add Pod Security Standard Policies

```bash
helm upgrade --install kyverno-policies kyverno/kyverno-policies -n kyverno --set podSecurityStandard=restricted
```

Add Policy Reporter

```bash
helm install policy-reporter policy-reporter/policy-reporter --create-namespace -n policy-reporter --set ui.enabled=true --set kyverno-plugin.enabled=true --version ^2.0.0
kubectl port-forward service/policy-reporter 8080:8080 -n policy-reporter
```

To start local development, use the `yarn dev` command. This command starts the local development server using the `dev` folders inside the `kyverno-policy-reports` and `kyverno-policy-reports-backend` directories.

```sh
yarn start
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

## Publishing New Versions of a Package

### Step 1: Update the package.json version

First, you need to update the `version` field in the `package.json` file of the package you want to update.

### Step 2: Run Yarn Install

Before creating a pull request, always run `yarn install` to ensure all dependencies are correctly installed and up-to-date.

### Step 3: Include the updated yarn.lock in the pull request

When creating a pull request, make sure to include the updated `yarn.lock` file. This file ensures that the exact same dependency tree is installed across all environments.

### Step 4: Merge the branch with main

After updating the `package.json` version, merge your branch with the `main` branch. The GitHub Actions workflow will automatically check if there's a new version and publish it.
