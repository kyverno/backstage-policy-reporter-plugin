import { useState } from 'react';
import { useAsync } from 'react-use';
import { Environment } from '../components/EntityKyvernoPolicyReportsContent/EntityKyvernoPolicyReportsContent';
import {
  CATALOG_FILTER_EXISTS,
  catalogApiRef,
} from '@backstage/plugin-catalog-react';
import { useApi } from '@backstage/core-plugin-api';
import { Entity } from '@backstage/catalog-model';

export const useEntityEnvironment = (
  entity: Entity,
  annotationsState: boolean,
) => {
  const catalogApi = useApi(catalogApiRef);
  const [currentEnvironment, setCurrentEnvironment] = useState<
    Environment | undefined
  >(undefined);

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

      setCurrentEnvironment(environmentList[0]);

      return environmentList;
    }, [entity]);

  return {
    environments,
    environmentsLoading,
    currentEnvironment,
    setCurrentEnvironment,
  };
};
