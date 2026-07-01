import { mockServices } from '@backstage/backend-test-utils';
import { CatalogService } from '@backstage/plugin-catalog-node';
import { catalogServiceMock } from '@backstage/plugin-catalog-node/testUtils';
import { PolicyReporterService } from './policyReporterService';

const logger = mockServices.logger.mock();
const authService = mockServices.auth.mock();
// catalogServiceMock currently returns a CatalogApi instead of CatalogService
const catalogService = catalogServiceMock({ entities: [] }) as CatalogService;

describe('PolicyReporterService', () => {
  it('creates service with default mocked rootConfig service', () => {
    const service = new PolicyReporterService({
      logger,
      catalogService,
      authService,
      configService: mockServices.rootConfig(),
    });

    expect(service).toBeDefined();
  });

  describe('defaultHeaders', () => {
    it('adds configured policyReporter.headers values while keeping Content-Type', () => {
      const headers = {
        Authorization: 'Bearer test-token',
        'X-Tenant': 'team-a',
      };

      const service = new PolicyReporterService({
        logger,
        catalogService,
        authService,
        configService: mockServices.rootConfig({
          data: {
            policyReporter: {
              requestHeaders: {
                ...headers,
              },
            },
          },
        }),
      });

      expect(Reflect.get(service, 'defaultHeaders')).toEqual({
        'Content-Type': 'application/json',
        ...headers,
      });
    });

    it('keeps defaultHeaders valid when policyReporter.headers is undefined', () => {
      const service = new PolicyReporterService({
        logger,
        catalogService,
        authService,
        configService: mockServices.rootConfig(),
      });

      expect(Reflect.get(service, 'defaultHeaders')).toEqual({
        'Content-Type': 'application/json',
      });
    });
  });
});
