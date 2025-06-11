import { useState } from 'react';
import { useAsync } from 'react-use';
import { Environment } from '@kyverno/backstage-plugin-policy-reporter-common';
import {
  CATALOG_FILTER_EXISTS,
  catalogApiRef,
} from '@backstage/plugin-catalog-react';
import { useApi } from '@backstage/core-plugin-api';

export const useEnvironments = () => {
  const catalogApi = useApi(catalogApiRef);
  const [currentEnvironment, setCurrentEnvironment] = useState<
    Environment | undefined
  >(undefined);

  const { value: environments, loading: environmentsLoading } = useAsync(
    async (): Promise<Environment[] | undefined> => {
      const entities = await catalogApi.getEntities({
        fields: ['metadata.name', 'metadata.namespace', 'kind'],
        filter: {
          kind: 'Resource',
          'spec.type': 'kubernetes-cluster',
          'metadata.annotations.kyverno.io/endpoint': CATALOG_FILTER_EXISTS,
        },
      });

      if (!entities) return undefined;

      const environmentList: Environment[] = entities.items.map(
        (entity, index) => ({
          id: index,
          entityRef: `${entity.kind}:${entity.metadata.namespace}/${entity.metadata.name}`,
          name: entity.metadata.name,
        }),
      );

      setCurrentEnvironment(environmentList[0]);

      return environmentList;
    },
  );

  return {
    environments,
    environmentsLoading,
    currentEnvironment,
    setCurrentEnvironment,
  };
};
