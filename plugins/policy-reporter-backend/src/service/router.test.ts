import { mockServices } from '@backstage/backend-test-utils';
import express from 'express';
import request from 'supertest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { Entity } from '@backstage/catalog-model';
import { createRouter } from './router';
import { catalogServiceMock } from '@backstage/plugin-catalog-node/testUtils';
import { CatalogService } from '@backstage/plugin-catalog-node';
import { PolicyReporterService } from './policyReporterService';
import { PluginPolicyService } from './plugins/pluginPolicyService';
import { TRIVY_PLUGIN, VAP_PLUGIN } from './plugins/descriptors';
import {
  KYVERNO_ENDPOINT_ANNOTATION,
  KYVERNO_PLUGIN_TRIVY_ENDPOINT_ANNOTATION,
  KYVERNO_PLUGIN_VAP_ENDPOINT_ANNOTATION,
} from '@kyverno/backstage-plugin-policy-reporter-common';

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
  {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Resource',
    metadata: {
      name: 'vap',
      description: 'Cluster with the VAP plugin',
      annotations: {
        'kyverno.io/plugin-vap-endpoint':
          'http://kyverno.io/policy-reporter-vap',
      },
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
      name: 'trivy',
      description: 'Cluster with the Trivy plugin',
      annotations: {
        'kyverno.io/plugin-trivy-endpoint':
          'http://kyverno.io/policy-reporter-trivy',
      },
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
      name: 'trivy-failing',
      description: 'Cluster whose Trivy plugin answers with an error',
      annotations: {
        'kyverno.io/plugin-trivy-endpoint':
          'http://kyverno.io/policy-reporter-trivy-failing',
      },
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
      name: 'trivy-unreachable',
      description: 'Cluster whose Trivy plugin cannot be reached',
      annotations: {
        'kyverno.io/plugin-trivy-endpoint':
          'http://kyverno.io/policy-reporter-trivy-unreachable',
      },
    },
    spec: {
      type: 'kubernetes-cluster',
      owner: 'user:guest',
    },
  },
];

const TRIVY_POLICIES = [
  {
    category: 'Vulnerability Scan',
    name: 'CVE-2021-3121',
    title: 'CVE-2021-3121',
    severity: 'high',
  },
];

describe('createRouter', () => {
  let app: express.Express;

  const server = setupServer(
    // Setup the mock response for Connector alter offset
    http.get(
      'http://kyverno.io/policy-reporter/api/v1/namespaced-resources/results',
      () =>
        HttpResponse.json({
          count: 0,
          items: [],
        }),
    ),
    http.get(
      'http://kyverno.io/policy-reporter/api/v1/cluster-resources/results',
      () =>
        HttpResponse.json({
          count: 1,
          items: [
            {
              source: 'kyverno',
              kind: 'Namespace',
              name: 'kube-system',
              status: 'pass',
            },
          ],
        }),
    ),
    http.get('http://kyverno.io/policy-reporter/api/v1/namespaces', () =>
      HttpResponse.json(['default', 'kube-system']),
    ),
    http.get(
      'http://kyverno.io/policy-reporter/api/v1/namespaced-resources/sources',
      () => HttpResponse.json(['kyverno', 'trivy']),
    ),
    http.get(
      'http://kyverno.io/policy-reporter/api/v1/namespaced-resources/kinds',
      () => HttpResponse.json(['Deployment', 'Pod']),
    ),

    http.get(
      'http://kyverno.io/policy-reporter/api/v1/namespaced-resources/categories',
      () =>
        HttpResponse.json([
          'Pod Security Standards (Default)',
          'Pod Security Standards (Restricted)',
        ]),
    ),

    http.get(
      'http://kyverno.io/policy-reporter/api/v1/namespaced-resources/policies',
      () =>
        HttpResponse.json([
          'require-non-root-groups',
          'require-request-limits',
        ]),
    ),
    http.get(
      'http://kyverno.io/policy-reporter/api/v1/cluster-resources/sources',
      () => HttpResponse.json(['kyverno', 'trivy']),
    ),
    http.get(
      'http://kyverno.io/policy-reporter/api/v1/cluster-resources/kinds',
      () => HttpResponse.json(['ClusterRole', 'Namespace']),
    ),
    http.get(
      'http://kyverno.io/policy-reporter/api/v1/cluster-resources/categories',
      () => HttpResponse.json(['Cluster Security']),
    ),
    http.get(
      'http://kyverno.io/policy-reporter/api/v1/cluster-resources/policies',
      () => HttpResponse.json(['require-labels', 'disallow-privileged']),
    ),
    http.get('http://kyverno.io/policy-reporter-vap/v1/policies', () =>
      HttpResponse.json([
        {
          category: 'Pod Security',
          name: 'deny-privileged',
          title: 'Deny Privileged',
          severity: 'high',
        },
      ]),
    ),
    http.get('http://kyverno.io/policy-reporter-trivy/v1/policies', () =>
      HttpResponse.json(TRIVY_POLICIES),
    ),
    http.get(
      'http://kyverno.io/policy-reporter-trivy-failing/v1/policies',
      () => new HttpResponse(null, { status: 500 }),
    ),
    http.get(
      'http://kyverno.io/policy-reporter-trivy-unreachable/v1/policies',
      () => HttpResponse.error(),
    ),
  );

  beforeAll(async () => {
    // supertest issues real loopback requests to the Express server under
    // test, so unhandled requests must be allowed through.
    server.listen({ onUnhandledRequest: 'warn' });
    const logger = mockServices.logger.mock();
    const config = mockServices.rootConfig();
    const authService = mockServices.auth();
    // catalogServiceMock currently returns a CatalogApi instead of CatalogService
    const catalogService = catalogServiceMock({
      entities: mockEntities,
    }) as CatalogService;

    const policyReporterService = new PolicyReporterService({
      logger,
      configService: config,
      catalogService,
      authService,
    });

    const vapPluginService = new PluginPolicyService({
      logger,
      configService: config,
      catalogService,
      authService,
      descriptor: VAP_PLUGIN,
    });

    const trivyPluginService = new PluginPolicyService({
      logger,
      configService: config,
      catalogService,
      authService,
      descriptor: TRIVY_PLUGIN,
    });

    const router = await createRouter({
      logger,
      config,
      policyReporterService,
      vapPluginService,
      trivyPluginService,
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
        `/namespaced-resources/results?environment=resource%3Adefault%2Fdev`,
      );

      expect(response.status).toBe(400);
      expect(response.body).toStrictEqual({
        error: `Entity missing '${KYVERNO_ENDPOINT_ANNOTATION}' annotation`,
      });
    });

    it('Should return 404 if entity is not found in catalog', async () => {
      const response = await request(app).get(
        `/namespaced-resources/results?environment=resource%3Adefault%2Finvalid`,
      );

      expect(response.status).toBe(404);
      expect(response.body).toStrictEqual({
        error: 'Entity not found',
      });
    });

    it('Should return 200 and valid response when entity is valid', async () => {
      const response = await request(app).get(
        `/namespaced-resources/results?environment=resource%3Adefault%2Fprod`,
      );
      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual({
        count: 0,
        items: [],
      });
    });
  });

  describe('namespaces', () => {
    it('Should return 400 if entity is missing kyverno.io/endpoint annotation', async () => {
      const response = await request(app).get(
        `/v1/namespaces?environment=resource%3Adefault%2Fdev`,
      );

      expect(response.status).toBe(400);
      expect(response.body).toStrictEqual({
        error: `Entity missing '${KYVERNO_ENDPOINT_ANNOTATION}' annotation`,
      });
    });

    it('Should return 404 if entity is not found in the catalog', async () => {
      const response = await request(app).get(
        `/v1/namespaces?environment=resource%3Adefault%2Finvalid`,
      );

      expect(response.status).toBe(404);
      expect(response.body).toStrictEqual({
        error: 'Entity not found',
      });
    });

    it('Should return 200 and valid response when entity is valid', async () => {
      const response = await request(app).get(
        `/v1/namespaces?environment=resource%3Adefault%2Fprod`,
      );

      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual(['default', 'kube-system']);
    });
  });

  describe('sources', () => {
    it('Should return 400 if entity is missing kyverno.io/endpoint annotation', async () => {
      const response = await request(app).get(
        `/v1/namespaced-resources/sources?environment=resource%3Adefault%2Fdev`,
      );

      expect(response.status).toBe(400);
      expect(response.body).toStrictEqual({
        error: `Entity missing '${KYVERNO_ENDPOINT_ANNOTATION}' annotation`,
      });
    });

    it('Should return 404 if entity is not found in the catalog', async () => {
      const response = await request(app).get(
        `/v1/namespaced-resources/sources?environment=resource%3Adefault%2Finvalid`,
      );

      expect(response.status).toBe(404);
      expect(response.body).toStrictEqual({
        error: 'Entity not found',
      });
    });

    it('Should return 200 and valid response when entity is valid', async () => {
      const response = await request(app).get(
        `/v1/namespaced-resources/sources?environment=resource%3Adefault%2Fprod`,
      );

      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual(['kyverno', 'trivy']);
    });
  });

  describe('kinds', () => {
    it('Should return 400 if entity is missing kyverno.io/endpoint annotation', async () => {
      const response = await request(app).get(
        `/v1/namespaced-resources/kinds?environment=resource%3Adefault%2Fdev`,
      );

      expect(response.status).toBe(400);
      expect(response.body).toStrictEqual({
        error: `Entity missing 'kyverno.io/endpoint' annotation`,
      });
    });

    it('Should return 404 if entity is not found in the catalog', async () => {
      const response = await request(app).get(
        `/v1/namespaced-resources/kinds?environment=resource%3Adefault%2Finvalid`,
      );

      expect(response.status).toBe(404);
      expect(response.body).toStrictEqual({
        error: 'Entity not found',
      });
    });

    it('Should return 200 and valid response when entity is valid', async () => {
      const response = await request(app).get(
        `/v1/namespaced-resources/kinds?environment=resource%3Adefault%2Fprod`,
      );

      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual(['Deployment', 'Pod']);
    });
  });

  describe('categories', () => {
    it('Should return 400 if entity is missing kyverno.io/endpoint annotation', async () => {
      const response = await request(app).get(
        `/v1/namespaced-resources/categories?environment=resource%3Adefault%2Fdev`,
      );

      expect(response.status).toBe(400);
      expect(response.body).toStrictEqual({
        error: `Entity missing 'kyverno.io/endpoint' annotation`,
      });
    });

    it('Should return 404 if entity is not found in the catalog', async () => {
      const response = await request(app).get(
        `/v1/namespaced-resources/categories?environment=resource%3Adefault%2Finvalid`,
      );

      expect(response.status).toBe(404);
      expect(response.body).toStrictEqual({
        error: 'Entity not found',
      });
    });

    it('Should return 200 and valid response when entity is valid', async () => {
      const response = await request(app).get(
        `/v1/namespaced-resources/categories?environment=resource%3Adefault%2Fprod`,
      );

      expect(response.status).toBe(200);

      expect(response.body).toStrictEqual([
        'Pod Security Standards (Default)',
        'Pod Security Standards (Restricted)',
      ]);
    });
  });

  describe('cluster policies', () => {
    it('Should return 400 if entity is missing kyverno.io/endpoint annotation', async () => {
      const response = await request(app).get(
        `/v1/cluster-resources/results?environment=resource%3Adefault%2Fdev`,
      );

      expect(response.status).toBe(400);
      expect(response.body).toStrictEqual({
        error: `Entity missing 'kyverno.io/endpoint' annotation`,
      });
    });

    it('Should return 404 if entity is not found in the catalog', async () => {
      const response = await request(app).get(
        `/v1/cluster-resources/results?environment=resource%3Adefault%2Finvalid`,
      );

      expect(response.status).toBe(404);
      expect(response.body).toStrictEqual({
        error: 'Entity not found',
      });
    });

    it('Should return 200 and valid response when entity is valid', async () => {
      const response = await request(app).get(
        `/v1/cluster-resources/results?environment=resource%3Adefault%2Fprod`,
      );

      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual({
        count: 1,
        items: [
          {
            source: 'kyverno',
            kind: 'Namespace',
            name: 'kube-system',
            status: 'pass',
          },
        ],
      });
    });
  });

  describe('namespaced policies', () => {
    it('Should return 404 if entity is not found in the catalog', async () => {
      const response = await request(app).get(
        `/v1/namespaced-resources/policies?environment=resource%3Adefault%2Finvalid`,
      );

      expect(response.status).toBe(404);
      expect(response.body).toStrictEqual({
        error: 'Entity not found',
      });
    });

    it('Should return 200 and valid response when entity is valid', async () => {
      const response = await request(app).get(
        `/v1/namespaced-resources/policies?environment=resource%3Adefault%2Fprod`,
      );

      expect(response.status).toBe(200);

      expect(response.body).toStrictEqual([
        'require-non-root-groups',
        'require-request-limits',
      ]);
    });

    it('Should return 400 if entity is missing kyverno.io/endpoint annotation', async () => {
      const response = await request(app).get(
        `/v1/namespaced-resources/policies?environment=resource%3Adefault%2Fdev`,
      );

      expect(response.status).toBe(400);
      expect(response.body).toStrictEqual({
        error: `Entity missing 'kyverno.io/endpoint' annotation`,
      });
    });
  });

  describe.each([
    ['cluster sources', 'sources', ['kyverno', 'trivy']],
    ['cluster kinds', 'kinds', ['ClusterRole', 'Namespace']],
    ['cluster categories', 'categories', ['Cluster Security']],
    [
      'cluster policy names',
      'policies',
      ['require-labels', 'disallow-privileged'],
    ],
  ])('%s', (_name, path, expected) => {
    it('Should return 400 if entity is missing kyverno.io/endpoint annotation', async () => {
      const response = await request(app).get(
        `/v1/cluster-resources/${path}?environment=resource%3Adefault%2Fdev`,
      );

      expect(response.status).toBe(400);
      expect(response.body).toStrictEqual({
        error: `Entity missing '${KYVERNO_ENDPOINT_ANNOTATION}' annotation`,
      });
    });

    it('Should return 404 if entity is not found in the catalog', async () => {
      const response = await request(app).get(
        `/v1/cluster-resources/${path}?environment=resource%3Adefault%2Finvalid`,
      );

      expect(response.status).toBe(404);
      expect(response.body).toStrictEqual({ error: 'Entity not found' });
    });

    it('Should return 200 and valid response when entity is valid', async () => {
      const response = await request(app).get(
        `/v1/cluster-resources/${path}?environment=resource%3Adefault%2Fprod`,
      );

      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual(expected);
    });
  });

  describe('vap plugin policies', () => {
    it('Should return 400 if entity is missing kyverno.io/plugin-vap-endpoint annotation', async () => {
      const response = await request(app).get(
        `/plugins/vap/v1/policies?environment=resource%3Adefault%2Fprod`,
      );

      expect(response.status).toBe(400);
      expect(response.body).toStrictEqual({
        error: `Entity missing '${KYVERNO_PLUGIN_VAP_ENDPOINT_ANNOTATION}' annotation`,
      });
    });

    it('Should return 404 if entity is not found in the catalog', async () => {
      const response = await request(app).get(
        `/plugins/vap/v1/policies?environment=resource%3Adefault%2Finvalid`,
      );

      expect(response.status).toBe(404);
      expect(response.body).toStrictEqual({ error: 'Entity not found' });
    });

    it('Should return 200 and valid response when entity is valid', async () => {
      const response = await request(app).get(
        `/plugins/vap/v1/policies?environment=resource%3Adefault%2Fvap`,
      );

      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual([
        {
          category: 'Pod Security',
          name: 'deny-privileged',
          title: 'Deny Privileged',
          severity: 'high',
        },
      ]);
    });
  });

  describe('trivy plugin policies', () => {
    it('Should return 400 if entity is missing kyverno.io/plugin-trivy-endpoint annotation', async () => {
      const response = await request(app).get(
        `/plugins/trivy/v1/policies?environment=resource%3Adefault%2Fprod`,
      );

      expect(response.status).toBe(400);
      expect(response.body).toStrictEqual({
        error: `Entity missing '${KYVERNO_PLUGIN_TRIVY_ENDPOINT_ANNOTATION}' annotation`,
      });
    });

    it('Should return 404 if entity is not found in the catalog', async () => {
      const response = await request(app).get(
        `/plugins/trivy/v1/policies?environment=resource%3Adefault%2Finvalid`,
      );

      expect(response.status).toBe(404);
      expect(response.body).toStrictEqual({ error: 'Entity not found' });
    });

    it('Should return 502 if the Trivy plugin answers with an error', async () => {
      const response = await request(app).get(
        `/plugins/trivy/v1/policies?environment=resource%3Adefault%2Ftrivy-failing`,
      );

      expect(response.status).toBe(502);
    });

    it('Should return 503 if the Trivy plugin cannot be reached', async () => {
      const response = await request(app).get(
        `/plugins/trivy/v1/policies?environment=resource%3Adefault%2Ftrivy-unreachable`,
      );

      expect(response.status).toBe(503);
    });

    it('Should return 200 and valid response when entity is valid', async () => {
      const response = await request(app).get(
        `/plugins/trivy/v1/policies?environment=resource%3Adefault%2Ftrivy`,
      );

      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual(TRIVY_POLICIES);
    });
  });
});
