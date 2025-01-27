import { createApiRef } from '@backstage/core-plugin-api';
import {
  Filter,
  Pagination,
  ResultList,
} from '@kyverno/backstage-plugin-policy-reporter-common';

export const policyReporterApiRef = createApiRef<PolicyReporterApi>({
  id: 'plugin.policy-reporter.service',
});

export type PolicyReporterApi = {
  namespacedResults: (
    environment: string,
    filter?: Filter,
    pagination?: Pagination,
  ) => Promise<ResultList>;
};
