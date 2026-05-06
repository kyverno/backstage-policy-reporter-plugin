import { Content, EmptyState, Progress } from '@backstage/core-components';
import { Box, Container, Flex, Grid, Header, ButtonLink } from '@backstage/ui';
import { useEnvironments } from '../../hooks/useEnvironments';
import { SelectEnvironment } from '../SelectEnvironment';
import { PolicyReportsTable } from '../PolicyReportsTable';
import { SelectStatus } from '../SelectStatus';
import { SelectSeverity } from '../SelectSeverity';
import { SelectNamespace } from '../SelectNamespace';
import { SearchField } from '../SearchField';
import { PolicyReportsFiltersProvider } from '../../hooks/usePolicyReportsFilters';
import { Filter } from '@kyverno/backstage-plugin-policy-reporter-common';

export interface PolicyReportsPageProps {
  title?: string;
  policyDocumentationUrl?: string;
  subtitle?: string;
}

export const PolicyReportsPage = ({
  title = 'Policy Reports',
  policyDocumentationUrl,
}: PolicyReportsPageProps) => {
  const { environments, environmentsLoading } = useEnvironments();

  const defaultFilter: Filter = {
    status: ['fail'],
  };

  // Loading environments
  if (environmentsLoading) return <Progress />;

  // Environments missing
  if (!environments?.length)
    return (
      <Container>
        <Header title={title} />
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
    <PolicyReportsFiltersProvider
      defaultFilters={defaultFilter}
      defaultEnvironment={environments[0].entityRef}
    >
      <Container>
        <Header
          title={title}
          customActions={<SelectEnvironment environments={environments} />}
        />
        <Content>
          <Grid.Root columns="1" gap="4">
            <Flex align="end" gap="4">
              <SelectStatus />
              <SelectSeverity />
              <SelectNamespace />
              <Box width="300px" style={{ flexShrink: 0 }}>
                <SearchField />
              </Box>
            </Flex>
            <PolicyReportsTable
              emptyContentText="No policies found"
              policyDocumentationUrl={policyDocumentationUrl}
            />
          </Grid.Root>
        </Content>
      </Container>
    </PolicyReportsFiltersProvider>
  );
};
