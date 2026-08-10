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
import { Container } from '@backstage/ui';
import { SelectStatus } from '../components/SelectStatus';
import { SelectSeverity } from '../components/SelectSeverity';
import { SelectNamespace } from '../components/SelectNamespace';
import { SelectSource } from '../components/SelectSource';
import { SelectKind } from '../components/SelectKind';
import { SelectCategory } from '../components/SelectCategory';
import { SelectPolicy } from '../components/SelectPolicy';

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
const policyReporterClusterPoliciesSubPage = SubPageBlueprint.make({
  name: 'cluster-policy',
  params: {
    path: 'cluster-policies',
    routeRef: createRouteRef(),
    title: 'Cluster Policies',
    loader: () =>
      import('./components/PolicyReporterPoliciesSubPage').then(m => (
        <Container>
          <m.PolicyReporterPoliciesSubPage
            // TODO: Add support for configuring initiallySelectedFilter using NFS
            initiallySelectedFilter={{ status: ['fail'] }}
            context="cluster"
            // TODO: Add support for configuring filters using NFS blueprint/extension
            filters={
              <>
                <SelectStatus />
                <SelectSeverity />
              </>
            }
          />
        </Container>
      )),
  },
});

/** @alpha */
const policyReporterNamespacedPoliciesSubPage = SubPageBlueprint.make({
  name: 'namespaced-policy',
  params: {
    path: 'namespaced-policies',
    routeRef: createRouteRef(),
    title: 'Namespaced Policies',
    loader: () =>
      import('./components/PolicyReporterPoliciesSubPage').then(m => (
        <Container>
          <m.PolicyReporterPoliciesSubPage
            // TODO: Add support for configuring initiallySelectedFilter using NFS
            initiallySelectedFilter={{ status: ['fail'] }}
            context="namespaced"
            // TODO: Add support for configuring filters using NFS blueprint/extension
            filters={
              <>
                <SelectStatus />
                <SelectSeverity />
                <SelectNamespace />
                <SelectSource />
                <SelectKind />
                <SelectCategory />
                <SelectPolicy />
              </>
            }
          />
        </Container>
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
    policyReporterNamespacedPoliciesSubPage,
    policyReporterClusterPoliciesSubPage,
  ],
});
