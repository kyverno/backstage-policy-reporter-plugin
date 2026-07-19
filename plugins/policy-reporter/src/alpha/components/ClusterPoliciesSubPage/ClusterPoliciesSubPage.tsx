import { Progress } from '@backstage/core-components';
import { Flex } from '@backstage/ui';
import { useEnvironments } from '../../../hooks/useEnvironments';
import { SelectEnvironment } from '../../../components/SelectEnvironment/';
import { PolicyReportsTable } from '../../../components/PolicyReportsTable';
import { SelectStatus } from '../../../components/SelectStatus';
import { SelectSeverity } from '../../../components/SelectSeverity';
import { SearchField } from '../../../components/SearchField';
import { PolicyReportsFiltersProvider } from '../../../hooks/usePolicyReportsFilters';
import { FilterLayout } from '../../../components/FilterLayout';
import { MissingKubernetesCluster } from '../../../components/MissingKubernetesCluster';
import { Filter } from '@kyverno/backstage-plugin-policy-reporter-common';

export interface ClusterPoliciesSubPageProps {
  // This naming aligns with the current Backstage catalog page
  initiallySelectedFilter?: Filter;
  // TODO: Could we implement something like this ?
  // columns?: TableColumn<CatalogTableRow>[] | CatalogTableColumnsFunc;
  // TODO: Implement injection of the filter components
  // filters?: ReactNode;
}

export const ClusterPoliciesSubPage = (props: ClusterPoliciesSubPageProps) => {
  const { initiallySelectedFilter } = props;
  const { environments, environmentsLoading } = useEnvironments();

  // Loading environments
  if (environmentsLoading) return <Progress />;

  // Environments missing
  if (!environments?.length) return <MissingKubernetesCluster />;

  return (
    <PolicyReportsFiltersProvider
      defaultEnvironment={environments[0].entityRef}
      context="cluster"
      defaultFilters={initiallySelectedFilter}
    >
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
    </PolicyReportsFiltersProvider>
  );
};
