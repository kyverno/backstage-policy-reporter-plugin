import { useMemo, useState } from 'react';
import { ListResult } from '@kyverno/backstage-plugin-policy-reporter-common';
import { Drawer } from '@material-ui/core';
import { StatusComponent } from '../StatusComponent';
import { SeverityComponent } from '../SeverityComponent';
import { Environment } from '@kyverno/backstage-plugin-policy-reporter-common';
import { PolicyReportsDrawerComponent } from '../PolicyReportsDrawerComponent';
import {
  CellText,
  ColumnConfig,
  Text,
  useTable,
  Table,
  Cell,
  Link,
} from '@backstage/ui';
import { useApi } from '@backstage/frontend-plugin-api';
import { policyReporterApiRef } from '../../api';
import { useFilterParams } from '../../hooks/useFilterParams';

interface PolicyReportsTableProps {
  currentEnvironment: Environment;
  emptyContentText: string;
  policyDocumentationUrl?: string;
}

export const PolicyReportsTable = ({
  emptyContentText,
  currentEnvironment,
  policyDocumentationUrl,
}: PolicyReportsTableProps) => {
  const policyReporterApi = useApi(policyReporterApiRef);
  const { filter: urlFilter, loading } = useFilterParams();
  // Memoize to avoid a new object reference on every render (which would cause
  // useTable to treat it as a changed dependency and re-fetch continuously).
  const filter = useMemo(() => {
    const { search: _, ...rest } = urlFilter;
    return rest;
  }, [urlFilter]);
  const search = urlFilter.search;

  const [drawerContent, setDrawerContent] = useState<ListResult | undefined>(
    undefined,
  );

  const { tableProps } = useTable({
    filter: filter,
    mode: 'offset',
    search: search,
    getData: async ({
      offset,
      pageSize,
      filter: fetchFilter,
      search: searchParam,
    }) => {
      // useTable provides:
      // - offset: absolute record position (0, 20, 40, 60...)
      // - pageSize: number of records per page (20)
      //
      // Policy Reporter API expects:
      // - page: page number starting from 1 (1, 2, 3, 4...)
      // - offset: number of results per page (this is actually pageSize)
      //
      // Example calculations:
      // useTable offset=0,  pageSize=20 → page=1 (first 20 records)
      // useTable offset=20, pageSize=20 → page=2 (records 21-40)
      // useTable offset=40, pageSize=20 → page=3 (records 41-60)

      // Convert useTable's absolute offset to 1-indexed page number
      // Math.floor(0/20) + 1 = 1, Math.floor(20/20) + 1 = 2, etc.
      const page = Math.floor(offset / pageSize) + 1;

      const response = await policyReporterApi.getNamespacedResults({
        query: {
          environment: encodeURI(currentEnvironment.entityRef),
          // page: which page to fetch (1-indexed)
          page: page,
          // offset: Policy Reporter API's name for results per page
          offset: pageSize,
          ...fetchFilter,
          search: searchParam === '' ? undefined : searchParam,
        },
      });

      const result = await response.json();

      return {
        data: result.items,
        totalCount: result.count,
      };
    },
  });

  const columns: ColumnConfig<ListResult>[] = [
    {
      id: 'name',
      label: 'Name',
      isRowHeader: true,
      cell: item => <CellText title={item.name} />,
    },
    {
      id: 'namespace',
      label: 'Namespace',
      isRowHeader: true,
      cell: item => <CellText title={item.namespace} />,
    },
    {
      id: 'kind',
      label: 'Kind',
      isRowHeader: true,
      cell: item => <CellText title={item.kind} />,
    },
    {
      id: 'policy',
      label: 'Policy',
      isRowHeader: true,
      cell: item => {
        if (policyDocumentationUrl) {
          return (
            <Cell>
              <Link
                target="_blank"
                href={`${policyDocumentationUrl}#${item.policy}`}
              >
                {item.policy}
              </Link>
            </Cell>
          );
        }
        return <CellText title={item.policy} />;
      },
    },
    {
      id: 'rule',
      label: 'Rule',
      isRowHeader: true,
      cell: item => <CellText title={item.rule} />,
    },
    {
      id: 'status',
      label: 'Status',
      isRowHeader: true,
      cell: item => (
        <Cell>
          <StatusComponent status={item.status} />
        </Cell>
      ),
    },
    {
      id: 'severity',
      label: 'Severity',
      isRowHeader: true,
      cell: item => (
        <Cell>
          <SeverityComponent severity={item.severity} />
        </Cell>
      ),
    },
  ];

  return (
    <>
      <Drawer
        anchor="right"
        open={Boolean(drawerContent)}
        onClose={() => setDrawerContent(undefined)}
      >
        <PolicyReportsDrawerComponent content={drawerContent} />
      </Drawer>
      <Table
        loading={loading}
        rowConfig={{
          onClick: item => setDrawerContent(item),
        }}
        emptyState={
          search ? (
            <Text>No results match "{search}"</Text>
          ) : (
            <Text>{emptyContentText}</Text>
          )
        }
        columnConfig={columns}
        {...tableProps}
      />
    </>
  );
};
