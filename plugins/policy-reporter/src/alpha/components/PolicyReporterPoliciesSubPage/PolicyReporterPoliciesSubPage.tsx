import { Progress } from '@backstage/core-components';
import { Flex } from '@backstage/ui';
import { useEnvironments } from '../../../hooks/useEnvironments';
import { SelectEnvironment } from '../../../components/SelectEnvironment';
import { PolicyReportsTable } from '../../../components/PolicyReportsTable';
import { SearchField } from '../../../components/SearchField';
import { PolicyReportsFiltersProvider } from '../../../hooks/usePolicyReportsFilters';
import { FilterLayout } from '../../../components/FilterLayout';
import { MissingKubernetesCluster } from '../../../components/MissingKubernetesCluster';
import { Filter } from '@kyverno/backstage-plugin-policy-reporter-common';
import { ReactNode } from 'react';

export interface PolicyReporterPoliciesSubPageProps {
  // This naming aligns with the current Backstage catalog page
  initiallySelectedFilter?: Filter;
  // TODO: Could we implement something like this ?
  // columns?: TableColumn<CatalogTableRow>[] | CatalogTableColumnsFunc;
  filters?: ReactNode;
  context: 'namespaced' | 'cluster';
}

export const PolicyReporterPoliciesSubPage = (
  props: PolicyReporterPoliciesSubPageProps,
) => {
  const { initiallySelectedFilter, filters, context } = props;
  const { environments, environmentsLoading } = useEnvironments();

  // Loading environments
  if (environmentsLoading) return <Progress />;

  // Environment missing
  if (!environments?.length) return <MissingKubernetesCluster />;

  return (
    <PolicyReportsFiltersProvider
      defaultEnvironment={environments[0].entityRef}
      context={context}
      defaultFilters={initiallySelectedFilter}
    >
      <FilterLayout>
        <FilterLayout.Filters>
          <SelectEnvironment environments={environments} />
          {filters}
        </FilterLayout.Filters>
        <FilterLayout.Content>
          <Flex direction="column" gap="4">
            <SearchField />
            <PolicyReportsTable emptyContentText="No policies found" />
          </Flex>
        </FilterLayout.Content>
      </FilterLayout>
    </PolicyReportsFiltersProvider>
  );
};
