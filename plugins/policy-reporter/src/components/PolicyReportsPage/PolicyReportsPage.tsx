import { Content, Progress } from '@backstage/core-components';
import { Container, Flex, Header } from '@backstage/ui';
import { useEnvironments } from '../../hooks/useEnvironments';
import { SelectEnvironment } from '../SelectEnvironment';
import { PolicyReportsTable } from '../PolicyReportsTable';
import { SelectStatus } from '../SelectStatus';
import { SelectSeverity } from '../SelectSeverity';
import { SelectNamespace } from '../SelectNamespace';
import { SearchField } from '../SearchField';
import { PolicyReportsFiltersProvider } from '../../hooks/usePolicyReportsFilters';
import { Filter } from '@kyverno/backstage-plugin-policy-reporter-common';
import { FilterLayout } from '../FilterLayout';
import { SelectSource } from '../SelectSource';
import { SelectKind } from '../SelectKind';
import { SelectCategory } from '../SelectCategory';
import { SelectPolicy } from '../SelectPolicy';
import { MissingKubernetesCluster } from '../MissingKubernetesCluster';

export interface PolicyReportsPageProps {
  title?: string;
  policyDocumentationUrl?: string;
  subtitle?: string;
}

export const PolicyReportsPage = ({
  title = 'Policy Reports',
  policyDocumentationUrl,
  subtitle,
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
          <MissingKubernetesCluster />
        </Content>
      </Container>
    );

  return (
    <PolicyReportsFiltersProvider
      context="namespaced"
      defaultFilters={defaultFilter}
      defaultEnvironment={environments[0].entityRef}
    >
      <Container>
        <Header
          title={title}
          description={subtitle}
          customActions={<SelectEnvironment environments={environments} />}
        />
        <Content>
          <FilterLayout>
            <FilterLayout.Filters>
              <SelectStatus />
              <SelectSeverity />
              <SelectNamespace />
              <SelectSource />
              <SelectKind />
              <SelectCategory />
              <SelectPolicy />
            </FilterLayout.Filters>
            <FilterLayout.Content>
              <Flex direction="column" gap="4">
                <SearchField />
                <PolicyReportsTable
                  emptyContentText="No policies found"
                  policyDocumentationUrl={policyDocumentationUrl}
                />
              </Flex>
            </FilterLayout.Content>
          </FilterLayout>
        </Content>
      </Container>
    </PolicyReportsFiltersProvider>
  );
};
