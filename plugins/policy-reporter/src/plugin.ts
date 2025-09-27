import {
  createApiFactory,
  createPlugin,
  createRoutableExtension,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';
import { DefaultApiClient } from '@kyverno/backstage-plugin-policy-reporter-common';
import { policyReporterApiRef } from './api';

export const policyReporterPlugin = createPlugin({
  id: 'policy-reporter',
  apis: [
    createApiFactory({
      api: policyReporterApiRef,
      deps: { fetchApi: fetchApiRef, discoveryApi: discoveryApiRef },
      factory: ({ discoveryApi, fetchApi }) =>
        new DefaultApiClient({ discoveryApi, fetchApi }),
    }),
  ],
});

export const EntityKyvernoPoliciesContent = policyReporterPlugin.provide(
  createRoutableExtension({
    name: 'EntityKyvernoPoliciesContent',
    component: () =>
      import('./components/EntityKyvernoPoliciesContent').then(
        m => m.EntityKyvernoPoliciesContent,
      ),
    mountPoint: rootRouteRef,
  }),
);

export const EntityCustomPoliciesContent = policyReporterPlugin.provide(
  createRoutableExtension({
    name: 'EntityCustomPoliciesContent',
    component: () =>
      import('./components/EntityCustomPoliciesContent').then(
        m => m.EntityCustomPoliciesContent,
      ),
    mountPoint: rootRouteRef,
  }),
);

export const PolicyReportsPage = policyReporterPlugin.provide(
  createRoutableExtension({
    name: 'PolicyReportsPage',
    component: () =>
      import('./components/PolicyReportsPage').then(m => m.PolicyReportsPage),
    mountPoint: rootRouteRef,
  }),
);
