import { mockServices } from '@backstage/backend-test-utils';
import { CatalogService } from '@backstage/plugin-catalog-node';
import { catalogServiceMock } from '@backstage/plugin-catalog-node/testUtils';
import { Entity } from '@backstage/catalog-model';
import { InputError } from '@backstage/errors';
import { KYVERNO_PLUGIN_VAP_ENDPOINT_ANNOTATION } from '@kyverno/backstage-plugin-policy-reporter-common';
import { VapPluginService } from './vapPluginService';

const logger = mockServices.logger.mock();
const authService = mockServices.auth();

const mockEntities: Entity[] = [
  {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Resource',
    metadata: {
      name: 'prod',
      annotations: {
        'kyverno.io/endpoint': 'http://kyverno.io/policy-reporter/api/',
      },
    },
    spec: {
      type: 'kubernetes-cluster',
      owner: 'user:guest',
    },
  },
];

// catalogServiceMock currently returns a CatalogApi instead of CatalogService
const catalogService = catalogServiceMock({
  entities: mockEntities,
}) as CatalogService;

describe('VapPluginService', () => {
  describe('defaultHeaders', () => {
    it('adds configured policyReporter.plugins.vap.requestHeaders while keeping Content-Type', () => {
      const service = new VapPluginService({
        logger,
        catalogService,
        authService,
        configService: mockServices.rootConfig({
          data: {
            policyReporter: {
              plugins: {
                vap: {
                  requestHeaders: { Authorization: 'Basic dmFwOnZhcA==' },
                },
              },
            },
          },
        }),
      });

      expect(Reflect.get(service, 'defaultHeaders')).toEqual({
        'Content-Type': 'application/json',
        Authorization: 'Basic dmFwOnZhcA==',
      });
    });

    it('does not use policyReporter.requestHeaders', () => {
      const service = new VapPluginService({
        logger,
        catalogService,
        authService,
        configService: mockServices.rootConfig({
          data: {
            policyReporter: {
              requestHeaders: { Authorization: 'Bearer core-token' },
            },
          },
        }),
      });

      expect(Reflect.get(service, 'defaultHeaders')).toEqual({
        'Content-Type': 'application/json',
      });
    });
  });

  describe('getVapPolicies', () => {
    it('throws InputError when the entity is missing the VAP endpoint annotation', async () => {
      const service = new VapPluginService({
        logger,
        catalogService,
        authService,
        configService: mockServices.rootConfig(),
      });

      await expect(
        service.getVapPolicies({ entityRef: 'resource:default/prod' }),
      ).rejects.toThrow(
        new InputError(
          `Entity missing '${KYVERNO_PLUGIN_VAP_ENDPOINT_ANNOTATION}' annotation`,
        ),
      );
    });
  });
});
