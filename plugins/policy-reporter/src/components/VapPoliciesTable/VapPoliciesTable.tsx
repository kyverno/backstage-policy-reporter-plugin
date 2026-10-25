import { useAsync } from 'react-use';
import {
  RequestError,
  Severity,
  VapPolicy,
} from '@kyverno/backstage-plugin-policy-reporter-common';
import {
  Cell,
  CellText,
  ColumnConfig,
  Table,
  Text,
  useTable,
} from '@backstage/ui';
import { toastApiRef, useApi } from '@backstage/frontend-plugin-api';
import { policyReporterApiRef } from '../../api';
import { SeverityComponent } from '../SeverityComponent';

type VapPolicyRow = VapPolicy & { id: string };

interface VapPoliciesTableProps {
  environment: string;
}

export const VapPoliciesTable = ({ environment }: VapPoliciesTableProps) => {
  const policyReporterApi = useApi(policyReporterApiRef);
  const toast = useApi(toastApiRef);

  const { value: policies, loading } = useAsync(async (): Promise<
    VapPolicyRow[]
  > => {
    const response = await policyReporterApi.getVapPolicies({
      query: { environment: encodeURI(environment) },
    });

    const result = await response.json();

    if (!response.ok) {
      toast.post({
        title: 'Failed to fetch validating admission policies',
        description:
          (result as unknown as RequestError).error ||
          response.statusText ||
          `Request failed with status ${response.status}`,
        status: 'danger',
      });
      return [];
    }

    return result.map(policy => ({ ...policy, id: policy.name }));
  }, [environment]);

  const { tableProps } = useTable({
    mode: 'complete',
    data: loading ? undefined : policies,
    paginationOptions: { pageSize: 20 },
  });

  const columns: ColumnConfig<VapPolicyRow>[] = [
    {
      id: 'title',
      label: 'Title',
      isRowHeader: true,
      cell: item => <CellText title={item.title} description={item.name} />,
    },
    {
      id: 'category',
      label: 'Category',
      cell: item => <CellText title={item.category ?? ''} />,
    },
    {
      id: 'severity',
      label: 'Severity',
      // Cap the badge column so the description gets the space
      maxWidth: 120,
      cell: item => (
        <Cell>
          <SeverityComponent
            severity={(item.severity as Severity | undefined) ?? null}
          />
        </Cell>
      ),
    },
    {
      id: 'description',
      label: 'Description',
      width: '2fr',
      cell: item => <CellText title={item.description ?? ''} />,
    },
  ];

  return (
    <Table
      emptyState={<Text>No validating admission policies found</Text>}
      columnConfig={columns}
      {...tableProps}
    />
  );
};
