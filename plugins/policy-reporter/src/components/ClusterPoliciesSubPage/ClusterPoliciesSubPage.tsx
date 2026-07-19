import { Content, EmptyState, Progress } from '@backstage/core-components';
import { Container, Flex, Header, ButtonLink } from '@backstage/ui';
import { useEnvironments } from '../../hooks/useEnvironments';
import { SelectEnvironment } from '../SelectEnvironment';
import { PolicyReportsTable } from '../PolicyReportsTable';
import { SelectStatus } from '../SelectStatus';
import { SelectSeverity } from '../SelectSeverity';
import { SearchField } from '../SearchField';
import { PolicyReportsFiltersProvider } from '../../hooks/usePolicyReportsFilters';
import { FilterLayout } from '../FilterLayout';

export const ClusterPoliciesSubPage = () => {
  const { environments, environmentsLoading } = useEnvironments();

  // Loading environments
  if (environmentsLoading) return <Progress />;

  // Environments missing
  if (!environments?.length)
    return (
      <Container>
        <Header title="Cluster Policies" />
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
      defaultEnvironment={environments[0].entityRef}
      context="cluster"
    >
      <Container>
        <Content>
          <FilterLayout>
            <FilterLayout.Filters>
              <SelectEnvironment environments={environments} />
              <SelectStatus />
              <SelectSeverity />
            </FilterLayout.Filters>
            <FilterLayout.Content>
              <Flex direction="column" gap="4">
                <SearchField />
                <PolicyReportsTable emptyContentText="No policies found" />
              </Flex>
            </FilterLayout.Content>
          </FilterLayout>
        </Content>
      </Container>
    </PolicyReportsFiltersProvider>
  );
};
