/**
 * Fixture data for the offline dev app.
 *
 * Two fake clusters are offered, `dev` with data and `empty` without, and the
 * plugin's own environment dropdown switches between them: every endpoint takes
 * an `environment` query param, so keying the data off it needs no extra
 * plumbing and survives filter changes, because it already lives in the URL.
 */
import type { Entity } from '@backstage/catalog-model';
import {
  KYVERNO_ENDPOINT_ANNOTATION,
  KYVERNO_KIND_ANNOTATION,
  KYVERNO_NAMESPACE_ANNOTATION,
  KYVERNO_PLUGIN_TRIVY_ENDPOINT_ANNOTATION,
  KYVERNO_PLUGIN_VAP_ENDPOINT_ANNOTATION,
  KYVERNO_RESOURCE_NAME_ANNOTATION,
  type ListResult,
  type PluginPolicy,
  type Severity,
  type Status,
} from '@kyverno/backstage-plugin-policy-reporter-common';

const CLUSTERS = [
  {
    name: 'dev',
    description: 'Development Cluster — populated',
    vap: true,
    trivy: true,
  },
  {
    name: 'empty',
    description: 'Empty Cluster — no results',
    vap: false,
    trivy: false,
  },
];

/** `metadata.namespace` is explicit because `useEnvironments` builds the
 * environment ref as `${kind}:${namespace}/${name}`. */
export const mockClusters: Entity[] = CLUSTERS.map(cluster => ({
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Resource',
  metadata: {
    name: cluster.name,
    namespace: 'default',
    description: cluster.description,
    annotations: {
      // Never fetched; the hooks only check that the annotation exists.
      [KYVERNO_ENDPOINT_ANNOTATION]: 'http://localhost:8080/',
      ...(cluster.vap && {
        [KYVERNO_PLUGIN_VAP_ENDPOINT_ANNOTATION]: 'http://localhost:8081/',
      }),
      ...(cluster.trivy && {
        [KYVERNO_PLUGIN_TRIVY_ENDPOINT_ANNOTATION]: 'http://localhost:8082/',
      }),
    },
  },
  spec: { type: 'kubernetes-cluster', owner: 'user:guest' },
}));

/**
 * The entity the dev entity page puts in context.
 *
 * Its annotations drive the content's default filters — namespace `kyverno`,
 * kinds Deployment and Pod, and a search for the resource name — so they are
 * deliberately matched by the first two entries in `NAMESPACED_RESOURCES`
 * below. `dependsOn` lists both clusters, so the environment dropdown switches
 * scenarios here too.
 */
export const mockEntity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'policy-reporter',
    namespace: 'default',
    description: 'Policy Reporter',
    annotations: {
      [KYVERNO_NAMESPACE_ANNOTATION]: 'kyverno',
      [KYVERNO_KIND_ANNOTATION]: 'Deployment,Pod',
      [KYVERNO_RESOURCE_NAME_ANNOTATION]: 'kyverno-background-controller',
    },
  },
  spec: {
    type: 'service',
    owner: 'user:guest',
    lifecycle: 'production',
    dependsOn: CLUSTERS.map(cluster => `resource:default/${cluster.name}`),
  },
};

/** Everything the fake catalog serves. */
export const mockEntities: Entity[] = [...mockClusters, mockEntity];

type PolicySeed = {
  policy: string;
  rule: string;
  source: string;
  category: string;
  severity: Severity;
  message: string;
};

const NAMESPACED_POLICIES: PolicySeed[] = [
  {
    policy: 'disallow-capabilities',
    rule: 'autogen-adding-capabilities',
    source: 'kyverno',
    category: 'Pod Security Standards (Baseline)',
    severity: 'medium',
    message:
      'Any capabilities added beyond the allowed list are disallowed. The field spec.containers[*].securityContext.capabilities.add must be empty.',
  },
  {
    policy: 'require-run-as-nonroot',
    rule: 'run-as-non-root',
    source: 'kyverno',
    category: 'Pod Security Standards (Restricted)',
    severity: 'high',
    message:
      'Running as root is not allowed. The field spec.securityContext.runAsNonRoot must be set to true.',
  },
  {
    policy: 'disallow-host-path',
    rule: 'host-path',
    source: 'kyverno',
    category: 'Pod Security Standards (Baseline)',
    severity: 'critical',
    message:
      'HostPath volumes are forbidden. The field spec.volumes[*].hostPath must be unset.',
  },
  {
    policy: 'require-requests-limits',
    rule: 'validate-resources',
    source: 'kyverno',
    category: 'Best Practices',
    severity: 'low',
    message: 'CPU and memory requests and limits are required.',
  },
  {
    policy: 'check-vulnerabilities',
    rule: 'cve-critical',
    source: 'trivy',
    category: 'Vulnerabilities',
    severity: 'info',
    message: 'CVE-2024-21626 (runc) allows a container escape to the host.',
  },
];

const CLUSTER_POLICIES: PolicySeed[] = [
  {
    policy: 'restrict-wildcard-verbs',
    rule: 'check-wildcard-verbs',
    source: 'kyverno',
    category: 'RBAC Best Practices',
    severity: 'critical',
    message:
      'Use of a wildcard in the verbs of a ClusterRole is not permitted.',
  },
  {
    policy: 'require-namespace-labels',
    rule: 'check-namespace-labels',
    source: 'kyverno',
    category: 'Best Practices',
    severity: 'low',
    message: 'The label `owner` is required on every Namespace.',
  },
  {
    policy: 'restrict-storageclass',
    rule: 'check-default-storageclass',
    source: 'trivy',
    category: 'Best Practices',
    severity: 'medium',
    message: 'A default StorageClass must set reclaimPolicy to Delete.',
  },
];

const NAMESPACED_RESOURCES = [
  // The first two are a Deployment and its Pod, named and namespaced to match
  // `mockEntity`'s annotations so the entity page has rows to show.
  {
    namespace: 'kyverno',
    kind: 'Deployment',
    name: 'kyverno-background-controller',
  },
  {
    namespace: 'kyverno',
    kind: 'Pod',
    name: 'kyverno-background-controller-7d9f8c5b4-xk2mq',
  },
  { namespace: 'policy-reporter', kind: 'Deployment', name: 'policy-reporter' },
  { namespace: 'default', kind: 'Deployment', name: 'nginx' },
  { namespace: 'default', kind: 'ConfigMap', name: 'app-config' },
  { namespace: 'kube-system', kind: 'Pod', name: 'coredns-787d4945fb-s9jwq' },
];

const CLUSTER_RESOURCES = [
  { namespace: '', kind: 'ClusterRole', name: 'cluster-admin' },
  {
    namespace: '',
    kind: 'ClusterRoleBinding',
    name: 'kyverno:background-controller',
  },
  { namespace: '', kind: 'Namespace', name: 'kube-system' },
  { namespace: '', kind: 'StorageClass', name: 'standard' },
];

/** Fail-heavy: both sub-pages open with `status: ['fail']` selected, so a
 * dataset of mostly passes would show an empty table on arrival. */
const STATUS_CYCLE: Status[] = [
  'fail',
  'pass',
  'fail',
  'warn',
  'fail',
  'skip',
  'fail',
  'error',
  'pass',
  'fail',
];

/** Fixed so screenshots stay identical between reloads: 2026-01-15T09:00:00Z. */
const BASE_TIMESTAMP = 1768467600;

function buildResults(
  resources: typeof NAMESPACED_RESOURCES,
  policies: PolicySeed[],
  scope: string,
): ListResult[] {
  return resources.flatMap((resource, resourceIndex) =>
    policies.map((seed, policyIndex) => {
      const index = resourceIndex * policies.length + policyIndex;
      const status = STATUS_CYCLE[index % STATUS_CYCLE.length];

      return {
        id: `${scope}-${index}`,
        ...resource,
        resourceId: `${scope}-${resourceIndex}`,
        message: seed.message,
        policy: seed.policy,
        rule: seed.rule,
        status,
        // Upstream reports no meaningful severity for a pass or a skip.
        severity:
          status === 'pass' || status === 'skip' ? 'info' : seed.severity,
        timestamp: BASE_TIMESTAMP - index * 1800,
        // `category` and `source` are only here on the wire, so this is
        // where ./fetch.ts filters on them.
        properties: {
          category: seed.category,
          source: seed.source,
          'policy.kyverno.io/scored': 'true',
        },
      };
    }),
  );
}

export const VAP_POLICIES: PluginPolicy[] = [
  {
    name: 'check-deployment-replicas',
    title: 'Check Deployment Replicas',
    category: 'Best Practices',
    severity: 'medium',
    description: 'Deployments must declare at least two replicas.',
  },
  {
    name: 'disallow-latest-tag',
    title: 'Disallow Latest Tag',
    category: 'Best Practices',
    severity: 'low',
    description: 'Container images must not use the `:latest` tag.',
  },
  {
    name: 'require-non-root-groups',
    title: 'Require Non-Root Groups',
    category: 'Pod Security Standards (Restricted)',
    severity: 'critical',
    description: 'Containers must not run with a root group.',
  },
];

/**
 * The sample response from the Trivy plugin's own README
 */
export const TRIVY_POLICIES: PluginPolicy[] = [
  {
    category: 'Vulnerability Scan',
    name: 'GHSA-m425-mq94-257g',
    title: 'gRPC-Go HTTP/2 Rapid Reset vulnerability',
    description: `### Impact
In affected releases of gRPC-Go, it is possible for an attacker to send HTTP/2 requests, cancel them, and send subsequent requests, which is valid by the HTTP/2 protocol, but would cause the gRPC-Go server to launch more concurrent method handlers than the configured maximum stream limit.

### Patches
This vulnerability was addressed by #6703 and has been included in patch releases: 1.56.3, 1.57.1, 1.58.3.  It is also included in the latest release, 1.59.0.

Along with applying the patch, users should also ensure they are using the \`grpc.MaxConcurrentStreams\` server option to apply a limit to the server's resources used for any single connection.

### Workarounds
None.

### References
#6703
`,
    severity: 'high',
  },
  {
    category: 'Vulnerability Scan',
    name: 'GHSA-9763-4f94-gfch',
    title: "CIRCL's Kyber: timing side-channel (kyberslash2)",
    description: `### Impact
On some platforms, when an attacker can time decapsulation of Kyber on forged cipher texts, they could possibly learn (parts of) the secret key.

Does not apply to ephemeral usage, such as when used in the regular way in TLS.

### Patches
Patched in 1.3.7.

### References
- [kyberslash.cr.yp.to](https://kyberslash.cr.yp.to/)`,
    severity: 'high',
  },
  {
    category: 'Vulnerability Scan',
    name: 'CVE-2021-3121',
    title: 'CVE-2021-3121',
    description:
      'An issue was discovered in GoGo Protobuf before 1.3.2. plugin/unmarshal/unmarshal.go lacks certain index validation, aka the "skippy peanut butter" issue.',
    severity: 'high',
  },
  {
    category: 'Vulnerability Scan',
    name: 'CVE-2023-44487',
    title: 'CVE-2023-44487',
    description:
      'The HTTP/2 protocol allows a denial of service (server resource consumption) because request cancellation can reset many streams quickly, as exploited in the wild in August through October 2023.',
    severity: 'high',
  },
  {
    category: 'Vulnerability Scan',
    name: 'CVE-2023-46219',
    title: 'CVE-2023-46219',
    description: `When saving HSTS data to an excessively long file name, curl could end up
removing all contents, making subsequent requests using that file unaware of
the HSTS status they should otherwise use.
`,
    severity: 'medium',
  },
];

export type MockDataset = {
  namespacedResults: ListResult[];
  clusterResults: ListResult[];
  vapPolicies: PluginPolicy[];
  trivyPolicies: PluginPolicy[];
};

const POPULATED: MockDataset = {
  namespacedResults: buildResults(
    NAMESPACED_RESOURCES,
    NAMESPACED_POLICIES,
    'ns',
  ),
  clusterResults: buildResults(CLUSTER_RESOURCES, CLUSTER_POLICIES, 'cluster'),
  vapPolicies: VAP_POLICIES,
  trivyPolicies: TRIVY_POLICIES,
};

const EMPTY: MockDataset = {
  namespacedResults: [],
  clusterResults: [],
  vapPolicies: [],
  trivyPolicies: [],
};

/**
 * `useEnvironments` builds the ref from `entity.kind`, giving
 * `Resource:default/dev`, so the lookup takes the trailing name rather than
 * matching the ref verbatim.
 */
export function datasetFor(environment: string): MockDataset {
  return environment.toLowerCase().endsWith('/empty') ? EMPTY : POPULATED;
}
