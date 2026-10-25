import { useState } from 'react';
import { Progress } from '@backstage/core-components';
import { Flex } from '@backstage/ui';
import { KYVERNO_PLUGIN_VAP_ENDPOINT_ANNOTATION } from '@kyverno/backstage-plugin-policy-reporter-common';
import { useEnvironments } from '../../../hooks/useEnvironments';
import { SelectEnvironment } from '../../../components/SelectEnvironment';
import { MissingVapPlugin } from '../../../components/MissingVapPlugin';
import { VapPoliciesTable } from '../../../components/VapPoliciesTable';

export const VapPoliciesSubPage = () => {
  const { environments, environmentsLoading } = useEnvironments(
    KYVERNO_PLUGIN_VAP_ENDPOINT_ANNOTATION,
  );
  const [environment, setEnvironment] = useState<string | undefined>();

  // Loading environments
  if (environmentsLoading) return <Progress />;

  // Environment missing
  if (!environments?.length) return <MissingVapPlugin />;

  // Default to the first environment until the user selects one
  const selectedEnvironment = environment ?? environments[0].entityRef;

  return (
    <Flex direction="column" gap="4">
      <SelectEnvironment
        environments={environments}
        value={selectedEnvironment}
        onChange={setEnvironment}
      />
      <VapPoliciesTable environment={selectedEnvironment} />
    </Flex>
  );
};
