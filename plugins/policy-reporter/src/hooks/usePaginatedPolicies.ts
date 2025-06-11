import { useAsync } from 'react-use';
import { Environment } from '@kyverno/backstage-plugin-policy-reporter-common';
import { useApi } from '@backstage/core-plugin-api';
import { policyReporterApiRef } from '../api';
import {
  Filter,
  ResultList,
} from '@kyverno/backstage-plugin-policy-reporter-common';
import { useEffect, useState } from 'react';

const DEFAULT_OFFSET = 5;
const DEFAULT_PAGE = 0;

export const usePaginatedPolicies = (
  currentEnvironment: Environment,
  filter: Filter,
) => {
  const policyReporterApi = useApi(policyReporterApiRef);
  const [currentPage, setCurrentPage] = useState<number>(DEFAULT_PAGE);
  const [currentOffset, setCurrentOffset] = useState<number>(DEFAULT_OFFSET);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);

  useEffect(() => {
    setInitialLoading(true);
  }, [currentEnvironment]);

  const {
    value: policies,
    loading: policiesLoading,
    error: policiesError,
  } = useAsync(async (): Promise<ResultList> => {
    const data = await policyReporterApi.namespacedResults(
      currentEnvironment.entityRef,
      filter,
      {
        // Material UI expects the first page to be 0. But the Policy Reporter API expects the first page to be 1
        // This increments the currentPage with 1 to match the expected page by the Policy Reporter API
        page: currentPage + 1,
        offset: currentOffset,
      },
    );
    setInitialLoading(false);
    return data;
  }, [currentEnvironment, filter, currentPage, currentOffset]);

  return {
    policies,
    policiesLoading,
    policiesError,
    currentPage,
    setCurrentPage,
    currentOffset,
    setCurrentOffset,
    initialLoading,
  };
};
