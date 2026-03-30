import { Content, EmptyState, Progress } from '@backstage/core-components';
import {
  Box,
  Container,
  Flex,
  Grid,
  HeaderPage,
  ButtonLink,
} from '@backstage/ui';
import { useEnvironments } from '../../hooks/useEnvironments';
import { SelectEnvironment } from '../SelectEnvironment';
import { PolicyReportsTable } from '../PolicyReportsTable';
import { SelectStatus } from '../SelectStatus';
import { SelectSeverity } from '../SelectSeverity';
import { SelectNamespace } from '../SelectNamespace';
import { useNamespaces } from '../../hooks/useNamespaces';
import { SearchField } from '../SearchField';

export interface PolicyReportsPageProps {
  title?: string;
  subtitle?: string;
}

export const PolicyReportsPage = ({
  title = 'Policy Reports',
  policyDocumentationUrl,
}: PolicyReportsPageProps) => {
  const {
    environments,
    environmentsLoading,
    setCurrentEnvironment,
    currentEnvironment,
  } = useEnvironments();

  const { namespaces: availableNamespaces } = useNamespaces(currentEnvironment);

  // Fetching environments
  if (environmentsLoading) return <Progress />;

  // Environments missing
  if (environments === undefined || !currentEnvironment)
    return (
      <Container>
        <HeaderPage title={title} />
        <Content>
          <EmptyState
            missing="content"
            title="No kubernetes-cluster Resources found"
            description={
              <>
                You need to define a Resource with the kubernetes-cluster type
                and a<code> kyverno.io/endpoint </code> annotation for this
                plugin to work.
              </>
            }
            action={
              <>
                <ButtonLink
                  target="_blank"
                  href="https://github.com/kyverno/backstage-policy-reporter-plugin"
                >
                  Read More
                </ButtonLink>
              </>
            }
          />
        </Content>
      </Container>
    );

  return (
    <Container>
      <HeaderPage
        title={title}
        customActions={
          <SelectEnvironment
            environments={environments}
            initialEnvironment={currentEnvironment}
            setCurrentEnvironment={setCurrentEnvironment}
          />
        }
      />
      <Content>
        <Grid.Root columns="1" gap="4">
          <Flex align="end" gap="4">
            <SelectStatus initialStatus={['fail']} />
            <SelectSeverity />
            <SelectNamespace availableNamespaces={availableNamespaces} />
            <Box width="300px" style={{ flexShrink: 0 }}>
              <SearchField />
            </Box>
          </Flex>
          <PolicyReportsTable
            currentEnvironment={currentEnvironment}
            emptyContentText="No policies found"
            policyDocumentationUrl={policyDocumentationUrl}
          />
        </Grid.Root>
      </Content>
    </Container>
  );
};
