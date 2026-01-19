import { useAsync } from 'react-use';
import { useApi } from '@backstage/core-plugin-api';
import { policyReporterApiRef } from '../api';
import { Environment } from '@kyverno/backstage-plugin-policy-reporter-common';

export const useNamespaces = (currentEnvironment?: Environment) => {
  const api = useApi(policyReporterApiRef);

  const {
    value: namespaces,
    loading,
    error,
  } = useAsync(async () => {
    if (!currentEnvironment) {
      return [];
    }

    const response = await api.getNamespaces({
      query: { environment: currentEnvironment.entityRef },
    });
    return response.json();
  }, [api, currentEnvironment]);

  return {
    namespaces: namespaces ?? [],
    loading,
    error,
  };
};
