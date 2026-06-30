import { AuthService, RootConfigService } from '@backstage/backend-plugin-api';
import { LoggerService } from '@backstage/backend-plugin-api';
import express from 'express';
import { MiddlewareFactory } from '@backstage/backend-defaults/rootHttpRouter';
import { CatalogService } from '@backstage/plugin-catalog-node';
import { createOpenApiRouter } from '../schema/openapi';
import { PolicyReporterService } from './policyReporterService';
import {
  ForwardedError,
  InputError,
  NotFoundError,
  ServiceUnavailableError,
} from '@backstage/errors';

export interface RouterOptions {
  logger: LoggerService;
  config: RootConfigService;
  catalogService: CatalogService;
  authService: AuthService;
}

function handlePolicyReporterError(
  error: unknown,
  response: express.Response,
): express.Response {
  if (error instanceof NotFoundError) {
    return response.status(404).json({ error: error.message });
  }

  if (error instanceof InputError) {
    return response.status(400).json({ error: error.message });
  }

  if (error instanceof ServiceUnavailableError) {
    return response.status(503).json({ error: error.message });
  }

  if (error instanceof ForwardedError) {
    return response.status(502).json({ error: error.message });
  }

  return response.status(500).json({ error: 'Unknown error' });
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, config, catalogService, authService } = options;

  const policyReporterService = new PolicyReporterService({
    logger,
    catalogService,
    authService,
    configService: config,
  });

  const router = await createOpenApiRouter();
  router.use(express.json());

  router.get('/namespaced-resources/results', async (request, response) => {
    try {
      const entityRef = decodeURIComponent(String(request.query.environment));

      const result = await policyReporterService.getNamespacedResourceResults({
        entityRef,
        query: request.query,
      });

      return response.status(200).json(result);
    } catch (error) {
      return handlePolicyReporterError(error, response);
    }
  });

  router.get('/v1/namespaces', async (request, response) => {
    try {
      const entityRef = decodeURIComponent(String(request.query.environment));

      const result = await policyReporterService.getNamespaces({
        entityRef,
        query: request.query,
      });

      return response.status(200).json(result);
    } catch (error) {
      return handlePolicyReporterError(error, response);
    }
  });

  router.get('/v1/namespaced-resources/sources', async (request, response) => {
    try {
      const entityRef = decodeURIComponent(String(request.query.environment));

      const result = await policyReporterService.getSources({
        entityRef,
      });

      return response.status(200).json(result);
    } catch (error) {
      return handlePolicyReporterError(error, response);
    }
  });

  router.get('/v1/namespaced-resources/kinds', async (request, response) => {
    try {
      const entityRef = decodeURIComponent(String(request.query.environment));

      const result = await policyReporterService.getKinds({
        entityRef,
        query: request.query,
      });

      return response.status(200).json(result);
    } catch (error) {
      return handlePolicyReporterError(error, response);
    }
  });

  router.get(
    '/v1/namespaced-resources/categories',
    async (request, response) => {
      try {
        const entityRef = decodeURIComponent(String(request.query.environment));

        const result = await policyReporterService.getCategories({
          entityRef,
          query: request.query,
        });

        return response.status(200).json(result);
      } catch (error) {
        return handlePolicyReporterError(error, response);
      }
    },
  );

  router.get('/v1/namespaced-resources/policies', async (request, response) => {
    try {
      const entityRef = decodeURIComponent(String(request.query.environment));

      const result = await policyReporterService.getPolicies({
        entityRef,
        query: request.query,
      });

      return response.status(200).json(result);
    } catch (error) {
      return handlePolicyReporterError(error, response);
    }
  });

  const middleware = MiddlewareFactory.create({ logger, config });

  router.use(middleware.error());
  return router;
}
