# Environment Decoupling Plan

## Problem

`currentEnvironment` is currently held in page state and prop-drilled into `SelectEnvironment`, `PolicyReportsTable`, `SelectNamespace`, and others. This creates tight coupling and makes adding new components harder.

## Goal

Move the selected environment into the URL as `?environment=<entityRef>`, making it available to any component without prop drilling. Filters must have zero dependency on environment.

The EntityRef needs to be URL encoded

## Approach

### 1. New hook: `useEnvironmentParam()`

A focused hook (similar to `useFilterParams`) that reads/writes `?environment=<entityRef>` from the URL.

```ts
const { environment, setEnvironment } = useEnvironmentParam();
```

### 2. Update `useEnvironments`

Keep it for fetching the list of available environments and the initial loading state (used by the page to gate rendering). On load, write the default environment to the URL if not already set — same pattern as `useFilterParams` defaults.

### 3. Update `SelectEnvironment`

- Still receives `environments[]` as a prop (for populating the dropdown options)
- Optionally receives `initialEnvironment` as a prop (for entity pages that derive the default from annotations/entity logic)
- Reads/writes the selected value via `useEnvironmentParam({ default: initialEnvironment ?? environments[0] })` internally
- Drop `currentEnvironment` and `setCurrentEnvironment` props

### 4. Update `SelectNamespace`

- Call `useEnvironmentParam()` internally to get the current environment for fetching available namespace options
- No environment prop needed

### 5. Update `PolicyReportsTable`

- Call `useEnvironmentParam()` internally for all API calls
- Drop the `currentEnvironment` prop entirely

### 6. Filters — no changes needed

`SelectStatus`, `SelectSeverity`, `SearchField` have no environment dependency and should stay that way.

## Resulting page structure

```tsx
// Page only manages the environments list + loading gate
const { environments, loading } = useEnvironments();
if (loading) return <Progress />;

<SelectEnvironment environments={environments} />  // prop for options only
<SelectNamespace />       // reads env from URL internally
<SelectStatus />
<SelectSeverity />
<SearchField />
<PolicyReportsTable />    // reads env from URL internally
```

## Constraints

- Filters must have no dependency on environment — enables easy addition of new filters
- `SelectEnvironment` may still receive `environments[]` as a prop (it lives outside the filter row)
- The URL is the single source of truth for the selected environment
- Bookmarked URLs with a specific environment should restore correctly
