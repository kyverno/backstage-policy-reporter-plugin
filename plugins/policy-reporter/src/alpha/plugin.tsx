import { createFrontendPlugin } from '@backstage/frontend-plugin-api';

import { rootRouteRef } from '../routes';

/** @alpha */
export default createFrontendPlugin({
  pluginId: 'policy-reporter',
  title: 'Policy Reporter',
  info: { packageJson: () => import('../../package.json') },
  routes: {
    root: rootRouteRef,
  },
  extensions: [],
});
