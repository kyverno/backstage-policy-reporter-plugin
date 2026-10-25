import { Progress } from '@backstage/core-components';
import { Flex } from '@backstage/ui';
import { KYVERNO_PLUGIN_VAP_ENDPOINT_ANNOTATION } from '@kyverno/backstage-plugin-policy-reporter-common';
import { useEnvironments } from '../../../hooks/useEnvironments';
import { EnvironmentProvider } from '../../../hooks/useEnvironment';
import { SelectEnvironment } from '../../../components/SelectEnvironment';
import { MissingVapPlugin } from '../../../components/MissingVapPlugin';
import { VapPoliciesTable } from '../../../components/VapPoliciesTable';

export const VapPoliciesSubPage = () => {
  const { environments, environmentsLoading } = useEnvironments(
    KYVERNO_PLUGIN_VAP_ENDPOINT_ANNOTATION,
  );

  // Loading environments
  if (environmentsLoading) return <Progress />;

  // Environment missing
  if (!environments?.length) return <MissingVapPlugin />;

  return (
    <EnvironmentProvider defaultEnvironment={environments[0].entityRef}>
      <Flex direction="column" gap="4">
        <SelectEnvironment environments={environments} />
        <VapPoliciesTable />
      </Flex>
    </EnvironmentProvider>
  );
};
