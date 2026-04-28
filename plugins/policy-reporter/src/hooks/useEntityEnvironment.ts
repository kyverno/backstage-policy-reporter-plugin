import { useAsync } from 'react-use';
import { Environment } from '@kyverno/backstage-plugin-policy-reporter-common';
import {
  CATALOG_FILTER_EXISTS,
  catalogApiRef,
} from '@backstage/plugin-catalog-react';
import { useApi } from '@backstage/core-plugin-api';
import { Entity } from '@backstage/catalog-model';
import { useEnvironmentParam } from './useEnvironmentParam';

export const useEntityEnvironment = (
  entity: Entity,
  annotationsState: boolean,
) => {
  const catalogApi = useApi(catalogApiRef);
  const { environment, setEnvironment } = useEnvironmentParam();

  const { value: environments, loading: environmentsLoading } =
    useAsync(async (): Promise<Environment[] | undefined> => {
      if (!annotationsState) return undefined;

      const dependencies = entity.spec?.dependsOn as string[];
      if (!dependencies) return undefined;

      const entities = await catalogApi.getEntitiesByRefs({
        entityRefs: dependencies as string[],
        fields: ['metadata.name'],
        filter: {
          kind: 'Resource',
          'spec.type': 'kubernetes-cluster',
          'metadata.annotations.kyverno.io/endpoint': CATALOG_FILTER_EXISTS,
        },
      });

      const environmentList: Environment[] = [];

      dependencies.forEach((dependency, index) => {
        if (entities.items[index]) {
          environmentList.push({
            id: environmentList.length,
            entityRef: dependency,
            name: entities.items[index]?.metadata.name as string,
          });
        }
      });

      // Write the first environment to the URL only if not already set.
      // Runs inside useAsync so it fires exactly once per entity — avoids a
      // useEffect dependency loop where setting the URL would re-trigger the effect.
      if (!environment && environmentList.length) {
        setEnvironment(environmentList[0].entityRef);
      }

      return environmentList;
    }, [entity]);

  return { environments, environmentsLoading, environment };
};
