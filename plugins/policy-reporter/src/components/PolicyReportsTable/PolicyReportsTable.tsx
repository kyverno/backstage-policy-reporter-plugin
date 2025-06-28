import {
  ResponseErrorPanel,
  Table,
  TableColumn,
} from '@backstage/core-components';
import { useMemo, useState } from 'react';
import {
  Filter,
  ListResult,
  Pagination,
} from '@kyverno/backstage-plugin-policy-reporter-common';
import { Drawer, makeStyles } from '@material-ui/core';
import Chip from '@material-ui/core/Chip';
import { StatusComponent } from '../StatusComponent';
import { SeverityComponent } from '../SeverityComponent';
import Launch from '@material-ui/icons/Launch';
import { Environment } from '@kyverno/backstage-plugin-policy-reporter-common';
import { usePaginatedPolicies } from '../../hooks/usePaginatedPolicies';
import { PolicyReportsDrawerComponent } from '../PolicyReportsDrawerComponent';

interface PolicyReportsTableProps {
  currentEnvironment: Environment;
  filter: Filter;
  title: string;
  emptyContentText: string;
  policyDocumentationUrl?: string;
  enableSearch?: boolean;
  pagination?: Partial<Pagination>;
  pageSizeOptions?: number[];
}

export const PolicyReportsTable = ({
  title,
  emptyContentText,
  currentEnvironment,
  filter,
  policyDocumentationUrl,
  enableSearch,
  pagination,
  pageSizeOptions,
}: PolicyReportsTableProps) => {
  const useStyles = makeStyles(theme => ({
    empty: {
      padding: theme.spacing(2),
      display: 'flex',
      justifyContent: 'center',
    },
  }));

  const [search, setSearch] = useState<string | undefined>(undefined);
  const mergedFilter = useMemo(
    () => ({
      ...filter,
      search: search ?? filter.search, // override search if search state is defined
    }),
    [filter, search],
  );

  const [showDrawer, setShowDrawer] = useState<boolean>(false);
  const [drawerContent, setDrawerContent] = useState<ListResult | undefined>(
    undefined,
  );
  const classes = useStyles();

  const columns: TableColumn<ListResult>[] = [
    {
      title: 'name',
      field: 'name',
    },
    {
      title: 'namespace',
      field: 'namespace',
    },
    {
      title: 'kind',
      field: 'kind',
    },
    {
      title: 'policy',
      field: 'policy',
      render: (listResult: ListResult) => {
        // When policyDocumentationUrl is provided create link to the Policy section
        if (policyDocumentationUrl)
          return (
            <Chip
              label={listResult.policy}
              component="a"
              target="_blank"
              href={`${policyDocumentationUrl}#${listResult.policy}`}
              clickable
              icon={<Launch fontSize="small" />}
            />
          );

        return <Chip label={listResult.policy} />;
      },
    },
    {
      title: 'rule',
      field: 'rule',
      render: (listResult: ListResult) => {
        return <Chip label={listResult.rule} />;
      },
    },
    {
      title: 'status',
      field: 'status',
      width: '30',
      render: (listResult: ListResult) => {
        return <StatusComponent status={listResult.status} />;
      },
    },
    {
      title: 'severity',
      field: 'severity',
      width: '30',
      render: (listResult: ListResult) => {
        return <SeverityComponent severity={listResult.severity} />;
      },
    },
  ];

  const {
    policies,
    policiesError,
    currentPage,
    currentOffset,
    setCurrentPage,
    setCurrentOffset,
    initialLoading,
  } = usePaginatedPolicies(currentEnvironment, mergedFilter, pagination);

  if (policiesError) return <ResponseErrorPanel error={policiesError} />;

  // Return loading table
  if (initialLoading)
    return (
      <Table
        options={{ paging: false, padding: 'dense' }}
        data={[]}
        columns={columns}
        isLoading
        title={title}
      />
    );

  return (
    <>
      <Drawer
        anchor="right"
        open={showDrawer}
        onClose={() => setShowDrawer(false)}
      >
        <PolicyReportsDrawerComponent content={drawerContent} />
      </Drawer>
      <Table
        options={{
          sorting: true,
          padding: 'dense',
          search: enableSearch,
          pageSize: currentOffset,
          pageSizeOptions: pageSizeOptions,
        }}
        onRowClick={(
          event?: React.MouseEvent<Element, MouseEvent>,
          rowData?: ListResult,
        ) => {
          event?.preventDefault();
          setShowDrawer(true);
          setDrawerContent(rowData);
        }}
        data={policies?.items ?? []}
        columns={columns}
        title={title}
        totalCount={policies?.count}
        page={currentPage}
        onRowsPerPageChange={page => setCurrentOffset(page)}
        onPageChange={page => setCurrentPage(page)}
        emptyContent={<div className={classes.empty}>{emptyContentText}</div>}
        onSearchChange={searchText => setSearch(searchText)}
      />
    </>
  );
};
