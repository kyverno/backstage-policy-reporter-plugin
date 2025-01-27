import {
  createApiFactory,
  createPlugin,
  createRoutableExtension,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/core-plugin-api';
import { policyReporterApiRef } from './api/PolicyReporterApi';
import { PolicyReporterApiClient } from './api/PolicyReporterClient';

import { rootRouteRef } from './routes';

export const kyvernoPolicyReportsPlugin = createPlugin({
  id: 'policy-reporter',
  apis: [
    createApiFactory({
      api: policyReporterApiRef,
      deps: { fetchApi: fetchApiRef, discoveryApi: discoveryApiRef },
      factory: ({ discoveryApi, fetchApi }) =>
        new PolicyReporterApiClient({ discoveryApi, fetchApi }),
    }),
  ],
});

export const EntityKyvernoPolicyReportsContent =
  kyvernoPolicyReportsPlugin.provide(
    createRoutableExtension({
      name: 'EntityKyvernoPoliciesContent',
      component: () =>
        import('./components/EntityKyvernoPoliciesContent').then(
          m => m.EntityKyvernoPoliciesContent,
        ),
      mountPoint: rootRouteRef,
    }),
  );
