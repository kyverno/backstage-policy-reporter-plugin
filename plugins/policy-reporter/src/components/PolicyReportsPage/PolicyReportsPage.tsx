import { Content, EmptyState, Progress } from '@backstage/core-components';
import { Container, Flex, Header, ButtonLink } from '@backstage/ui';
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
