import { Progress } from '@backstage/core-components';
import { Flex } from '@backstage/ui';
import { KYVERNO_PLUGIN_TRIVY_ENDPOINT_ANNOTATION } from '@kyverno/backstage-plugin-policy-reporter-common';
import { useEnvironments } from '../../../hooks/useEnvironments';
import { EnvironmentProvider } from '../../../hooks/useEnvironment';
import { SelectEnvironment } from '../../../components/SelectEnvironment';
import { MissingPlugin } from '../../../components/MissingPlugin';
import { TrivyPoliciesTable } from '../../../components/TrivyPoliciesTable';

export const TrivyPoliciesSubPage = () => {
  const { environments, environmentsLoading } = useEnvironments(
    KYVERNO_PLUGIN_TRIVY_ENDPOINT_ANNOTATION,
  );

  // Loading environments
  if (environmentsLoading) return <Progress />;

  // Environment missing
  if (!environments?.length)
    return (
      <MissingPlugin
        plugin="Trivy"
        annotation={KYVERNO_PLUGIN_TRIVY_ENDPOINT_ANNOTATION}
      />
    );

  return (
    <EnvironmentProvider defaultEnvironment={environments[0].entityRef}>
      <Flex direction="column" gap="4">
        <SelectEnvironment environments={environments} />
        <TrivyPoliciesTable />
      </Flex>
    </EnvironmentProvider>
  );
};
