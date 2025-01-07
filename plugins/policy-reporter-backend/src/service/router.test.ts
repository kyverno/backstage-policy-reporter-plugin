import { mockServices } from '@backstage/backend-test-utils';
import express from 'express';
import request from 'supertest';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { Entity } from '@backstage/catalog-model';
import { createRouter } from './router';
import { catalogServiceMock } from '@backstage/plugin-catalog-node/testUtils';
import { CatalogService } from '@backstage/plugin-catalog-node';

const mockEntities: Entity[] = [
  {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Resource',
    metadata: {
      name: 'dev',
      description: 'Development Cluster',
    },
    spec: {
      type: 'kubernetes-cluster',
      owner: 'user:guest',
    },
  },
  {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Resource',
    metadata: {
      name: 'prod',
      description: 'Development Cluster',
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

describe('createRouter', () => {
  let app: express.Express;

  const server = setupServer(
    // Setup the mock response for Connector alter offset
    rest.get('**v1/namespaced-resources/results', (_req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          count: 0,
          items: [],
        }),
      );
    }),
  );

  beforeAll(async () => {
    server.listen({});
    const router = await createRouter({
      logger: mockServices.logger.mock(),
      config: mockServices.rootConfig(),
      authService: mockServices.auth(),
      // catalogServiceMock currently returns a CatalogApi instead of CatalogService
      catalogService: catalogServiceMock({
        entities: mockEntities,
      }) as CatalogService,
    });
    app = express().use(router);
  });

  afterAll(() => server.close());
  afterEach(() => server.resetHandlers());

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('token', () => {
    it('Should return 400 if entity is missing kyverno.io/endpoint annotation', async () => {
      const response = await request(app).get(
        `/namespaced-resources/resource%3Adefault%2Fdev/results`,
      );

      expect(response.status).toBe(400);
      expect(response.body).toStrictEqual({
        error: `Entity missing 'kyverno.io/endpoint' annotation`,
      });
    });

    it.todo('Should return 400 if entity is invalid');

    it('Should return 400 if valid entity is not a kubernetes-cluster', async () => {
      const response = await request(app).get(
        `/namespaced-resources/valid%3Aentity%2Fref/results`,
      );

      expect(response.status).toBe(400);
      expect(response.body).toStrictEqual({
        error: 'Invalid entityRef',
      });
    });

    it('Should return 200 and valid response when entity is valid', async () => {
      const response = await request(app).get(
        `/namespaced-resources/resource%3Adefault%2Fprod/results`,
      );
      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual({
        count: 0,
        items: [],
      });
    });
  });
});
