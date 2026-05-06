import {
  ApiBlueprint,
  createFrontendPlugin,
  createRouteRef,
  discoveryApiRef,
  fetchApiRef,
  PageBlueprint,
  SubPageBlueprint,
} from '@backstage/frontend-plugin-api';

import { rootRouteRef } from '../routes';
import { policyReporterApiRef } from '../api';
import { DefaultApiClient } from '@kyverno/backstage-plugin-policy-reporter-common';

import { EntityContentBlueprint } from '@backstage/plugin-catalog-react/alpha';
import { isPolicyReporterAvailable } from '../utils/annotations';
import PolicyIcon from '@material-ui/icons/Policy';

/** @alpha */
export const policyReporterApi = ApiBlueprint.make({
  params: defineParams =>
    defineParams({
      api: policyReporterApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        fetchApi: fetchApiRef,
      },
      factory: ({ discoveryApi, fetchApi }) =>
        new DefaultApiClient({ discoveryApi, fetchApi }),
    }),
});

/** @alpha */
const policyReporterPage = PageBlueprint.make({
  params: {
    path: '/policy-reporter',
    routeRef: rootRouteRef,
    title: 'Policy Reporter',
    icon: <PolicyIcon />,
  },
});

/** @alpha */
const policyReporterNamespacedPoliciesPage = SubPageBlueprint.make({
  name: 'namespaced-policy',
  params: {
    path: 'namespaced-policies',
    routeRef: createRouteRef(),
    // TODO: Support configuration of the actual component
    title: 'Namespaced Policies',
    loader: () =>
      // TODO: Create dedicated PolicyReporterNamespacedPoliciesPage Component
      import('../components/PolicyReportsPage/').then(m => (
        <m.PolicyReportsPage /> // TODO: Update the PolicyReportsPage to be only used for old frontend system to mimic PageBlueprint from NFS
      )),
  },
});

/** @alpha */
const policyReporterEntityContent = EntityContentBlueprint.make({
  name: 'policy-reporter',
  params: {
    path: '/policy-reporter',
    title: 'Policy Reporter',
    // TODO: Support configuration of the actual component
    filter: isPolicyReporterAvailable,
    loader: () =>
      // TODO: Create dedicated EntityPolicyReporterContent component as replacement for Kyverno and Custom content components
      import('../components/EntityKyvernoPoliciesContent/').then(m => (
        <m.EntityKyvernoPoliciesContent />
      )),
  },
});

/** @alpha */
export default createFrontendPlugin({
  pluginId: 'policy-reporter',
  title: 'Policy Reporter',
  info: { packageJson: () => import('../../package.json') },
  routes: {
    root: rootRouteRef,
  },
  extensions: [
    policyReporterApi,
    policyReporterEntityContent,
    policyReporterPage,
    policyReporterNamespacedPoliciesPage,
  ],
});
