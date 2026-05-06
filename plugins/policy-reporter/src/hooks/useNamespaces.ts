import { useAsync } from 'react-use';
import { useApi } from '@backstage/core-plugin-api';
import { policyReporterApiRef } from '../api';

export const useNamespaces = (entityRef?: string) => {
  const api = useApi(policyReporterApiRef);

  const {
    value: namespaces,
    loading,
    error,
  } = useAsync(async () => {
    if (!entityRef) {
      return [];
    }

    const response = await api.getNamespaces({
      query: { environment: entityRef },
    });
    return response.json();
  }, [api, entityRef]);

  return {
    namespaces: namespaces ?? [],
    loading,
    error,
  };
};
