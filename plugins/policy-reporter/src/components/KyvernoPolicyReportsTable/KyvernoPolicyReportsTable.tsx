import {
  ResponseErrorPanel,
  Table,
  TableColumn,
} from '@backstage/core-components';
import React from 'react';
import {
  Filter,
  ListResult,
} from 'backstage-plugin-policy-reporter-common';
import { makeStyles } from '@material-ui/core';
import Chip from '@material-ui/core/Chip';
import { StatusComponent } from '../StatusComponent';
import { SeverityComponent } from '../SeverityComponent';
import Launch from '@material-ui/icons/Launch';
import { Environment } from '../EntityKyvernoPolicyReportsContent/EntityKyvernoPolicyReportsContent';
import { usePaginatedKyvernoPolicies } from '../../hooks/usePaginatedKyvernoPolicies';

interface KyvernoPolicyReportsTableProps {
  currentEnvironment: Environment;
  filter: Filter;
  title: string;
  emptyContentText: string;
  policyDocumentationUrl?: string;
}

export const KyvernoPolicyReportsTable = ({
  title,
  emptyContentText,
  currentEnvironment,
  filter,
  policyDocumentationUrl,
}: KyvernoPolicyReportsTableProps) => {
  const useStyles = makeStyles(theme => ({
    empty: {
      padding: theme.spacing(2),
      display: 'flex',
      justifyContent: 'center',
    },
  }));

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
    setCurrentPage,
    setCurrentOffset,
    initialLoading,
  } = usePaginatedKyvernoPolicies(currentEnvironment, filter);

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
    <Table
      options={{
        sorting: true,
        padding: 'dense',
      }}
      data={policies?.items ?? []}
      columns={columns}
      title={title}
      totalCount={policies?.count}
      page={currentPage}
      onRowsPerPageChange={page => setCurrentOffset(page)}
      onPageChange={page => setCurrentPage(page)}
      emptyContent={<div className={classes.empty}>{emptyContentText}</div>}
    />
  );
};
