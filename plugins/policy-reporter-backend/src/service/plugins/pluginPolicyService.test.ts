import { mockServices } from '@backstage/backend-test-utils';
import { CatalogService } from '@backstage/plugin-catalog-node';
import { catalogServiceMock } from '@backstage/plugin-catalog-node/testUtils';
import { Entity } from '@backstage/catalog-model';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { InputError } from '@backstage/errors';
import {
  KYVERNO_PLUGIN_TRIVY_ENDPOINT_ANNOTATION,
  KYVERNO_PLUGIN_VAP_ENDPOINT_ANNOTATION,
} from '@kyverno/backstage-plugin-policy-reporter-common';
import { PluginPolicyService } from './pluginPolicyService';
import { TRIVY_PLUGIN, VAP_PLUGIN } from './descriptors';

const logger = mockServices.logger.mock();
const authService = mockServices.auth();

const mockEntities: Entity[] = [
  {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Resource',
    metadata: {
      name: 'unannotated',
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
      annotations: {
        [KYVERNO_PLUGIN_VAP_ENDPOINT_ANNOTATION]:
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
      annotations: {
        [KYVERNO_PLUGIN_TRIVY_ENDPOINT_ANNOTATION]:
          'http://kyverno.io/policy-reporter-trivy',
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

const VAP_POLICIES = [
  {
    category: 'Pod Security',
    name: 'deny-privileged',
    title: 'Deny Privileged',
    severity: 'high',
  },
];

describe('PluginPolicyService', () => {
  const server = setupServer();

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterAll(() => server.close());
  afterEach(() => server.resetHandlers());

  describe('listPolicies', () => {
    it("requests the descriptor's endpoint annotation and returns the policies", async () => {
      const requestedUrls: string[] = [];

      server.use(
        http.get(
          'http://kyverno.io/policy-reporter-vap/v1/policies',
          ({ request }) => {
            requestedUrls.push(request.url);
            return HttpResponse.json(VAP_POLICIES);
          },
        ),
      );

      const service = new PluginPolicyService({
        logger,
        catalogService,
        authService,
        configService: mockServices.rootConfig(),
        descriptor: VAP_PLUGIN,
      });

      await expect(
        service.listPolicies({ entityRef: 'resource:default/vap' }),
      ).resolves.toEqual(VAP_POLICIES);

      expect(requestedUrls).toEqual([
        'http://kyverno.io/policy-reporter-vap/v1/policies',
      ]);
    });

    it("adds the descriptor's configured request headers while keeping Content-Type", async () => {
      const sentHeaders: Record<string, string | null>[] = [];

      server.use(
        http.get(
          'http://kyverno.io/policy-reporter-vap/v1/policies',
          ({ request }) => {
            sentHeaders.push({
              'Content-Type': request.headers.get('Content-Type'),
              Authorization: request.headers.get('Authorization'),
            });
            return HttpResponse.json(VAP_POLICIES);
          },
        ),
      );

      const service = new PluginPolicyService({
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
        descriptor: VAP_PLUGIN,
      });

      await service.listPolicies({ entityRef: 'resource:default/vap' });

      expect(sentHeaders).toEqual([
        {
          'Content-Type': 'application/json',
          Authorization: 'Basic dmFwOnZhcA==',
        },
      ]);
    });

    it('does not forward policyReporter.requestHeaders to a plugin API', async () => {
      const sentHeaders: Record<string, string | null>[] = [];

      server.use(
        http.get(
          'http://kyverno.io/policy-reporter-vap/v1/policies',
          ({ request }) => {
            sentHeaders.push({
              'Content-Type': request.headers.get('Content-Type'),
              Authorization: request.headers.get('Authorization'),
            });
            return HttpResponse.json(VAP_POLICIES);
          },
        ),
      );

      const service = new PluginPolicyService({
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
        descriptor: VAP_PLUGIN,
      });

      await service.listPolicies({ entityRef: 'resource:default/vap' });

      expect(sentHeaders).toEqual([
        { 'Content-Type': 'application/json', Authorization: null },
      ]);
    });

    it("throws InputError when the entity is missing the descriptor's annotation", async () => {
      const service = new PluginPolicyService({
        logger,
        catalogService,
        authService,
        configService: mockServices.rootConfig(),
        descriptor: VAP_PLUGIN,
      });

      await expect(
        service.listPolicies({ entityRef: 'resource:default/unannotated' }),
      ).rejects.toThrow(
        new InputError(
          `Entity missing '${KYVERNO_PLUGIN_VAP_ENDPOINT_ANNOTATION}' annotation`,
        ),
      );
    });
  });

  describe('a second plugin', () => {
    const TRIVY_POLICIES = [
      {
        category: 'Vulnerability Scan',
        name: 'CVE-2021-3121',
        title: 'CVE-2021-3121',
        severity: 'high',
      },
    ];

    it('resolves its own annotation and forwards its own configured headers', async () => {
      const requestedUrls: string[] = [];
      const sentAuthorization: (string | null)[] = [];

      server.use(
        http.get(
          'http://kyverno.io/policy-reporter-trivy/v1/policies',
          ({ request }) => {
            requestedUrls.push(request.url);
            sentAuthorization.push(request.headers.get('Authorization'));
            return HttpResponse.json(TRIVY_POLICIES);
          },
        ),
      );

      const service = new PluginPolicyService({
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
                trivy: {
                  requestHeaders: { Authorization: 'Bearer trivy-token' },
                },
              },
            },
          },
        }),
        descriptor: TRIVY_PLUGIN,
      });

      await expect(
        service.listPolicies({ entityRef: 'resource:default/trivy' }),
      ).resolves.toEqual(TRIVY_POLICIES);

      expect(requestedUrls).toEqual([
        'http://kyverno.io/policy-reporter-trivy/v1/policies',
      ]);
      expect(sentAuthorization).toEqual(['Bearer trivy-token']);
    });
  });

  describe('route groups', () => {
    it('is placed in the upstream path, so one base URL serves several groups', async () => {
      const requestedUrls: string[] = [];

      server.use(
        http.get(
          'http://kyverno.io/policy-reporter-vap/vpol/v1/policies',
          ({ request }) => {
            requestedUrls.push(request.url);
            return HttpResponse.json(VAP_POLICIES);
          },
        ),
      );

      const service = new PluginPolicyService({
        logger,
        catalogService,
        authService,
        configService: mockServices.rootConfig(),
        descriptor: VAP_PLUGIN,
      });

      await service.listPolicies({
        entityRef: 'resource:default/vap',
        group: 'vpol/v1',
      });

      expect(requestedUrls).toEqual([
        'http://kyverno.io/policy-reporter-vap/vpol/v1/policies',
      ]);
    });
  });
});
