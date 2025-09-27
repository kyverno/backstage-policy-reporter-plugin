import { createApiRef } from '@backstage/core-plugin-api';
import { DefaultApiClient } from '@kyverno/backstage-plugin-policy-reporter-common';

export const policyReporterApiRef = createApiRef<DefaultApiClient>({
  id: 'plugin.policy-reporter.service',
});
