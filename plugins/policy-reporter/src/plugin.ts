import {
  createApiFactory,
  createPlugin,
  createRoutableExtension,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/core-plugin-api';
import { kyvernoPolicyReportApiRef } from './api/kyvernoPolicyReportApi';
import { KyvernoPolicyReportClient } from './api/kyvernoPolicyReportClient';

import { rootRouteRef } from './routes';

export const kyvernoPolicyReportsPlugin = createPlugin({
  id: 'policy-reporter',
  apis: [
    createApiFactory({
      api: kyvernoPolicyReportApiRef,
      deps: { fetchApi: fetchApiRef, discoveryApi: discoveryApiRef },
      factory: ({ discoveryApi, fetchApi }) =>
        new KyvernoPolicyReportClient({ discoveryApi, fetchApi }),
    }),
  ],
});

export const EntityKyvernoPolicyReportsContent =
  kyvernoPolicyReportsPlugin.provide(
    createRoutableExtension({
      name: 'KyvernoPolicyReportsContent',
      component: () =>
        import('./components/EntityKyvernoPolicyReportsContent').then(
          m => m.EntityKyvernoPolicyReportsContent,
        ),
      mountPoint: rootRouteRef,
    }),
  );
