import { useAsync } from 'react-use';
import { Environment } from '@kyverno/backstage-plugin-policy-reporter-common';
import {
  CATALOG_FILTER_EXISTS,
  catalogApiRef,
} from '@backstage/plugin-catalog-react';
import { useApi } from '@backstage/core-plugin-api';
import { useEnvironmentParam } from './useEnvironmentParam';

export const useEnvironments = () => {
  const catalogApi = useApi(catalogApiRef);
  const { environment, setEnvironment } = useEnvironmentParam();

  const { value: environments, loading: environmentsLoading } =
    useAsync(async (): Promise<Environment[] | undefined> => {
      const entities = await catalogApi.getEntities({
        fields: ['metadata.name', 'metadata.namespace', 'kind'],
        filter: {
          kind: 'Resource',
          'spec.type': 'kubernetes-cluster',
          'metadata.annotations.kyverno.io/endpoint': CATALOG_FILTER_EXISTS,
        },
      });

      if (!entities) return undefined;

      const environmentList = entities.items.map((entity, index) => ({
        id: index,
        entityRef: `${entity.kind}:${entity.metadata.namespace}/${entity.metadata.name}`,
        name: entity.metadata.name,
      }));

      // Write the first environment to the URL only if not already set
      // (e.g. a bookmarked URL already has ?environment=...).
      if (!environment && environmentList.length) {
        setEnvironment(environmentList[0].entityRef);
      }

      return environmentList;
    }, []);

  return { environments, environmentsLoading };
};
