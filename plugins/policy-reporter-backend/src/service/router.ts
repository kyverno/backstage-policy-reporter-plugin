import { AuthService, RootConfigService } from '@backstage/backend-plugin-api';
import { LoggerService } from '@backstage/backend-plugin-api';
import express from 'express';
import { KYVERNO_ENDPOINT_ANNOTATION } from '@kyverno/backstage-plugin-policy-reporter-common';
import { MiddlewareFactory } from '@backstage/backend-defaults/rootHttpRouter';
import { CatalogService } from '@backstage/plugin-catalog-node';
import { createOpenApiRouter } from '../schema/openapi';

import * as parser from 'uri-template';

export interface RouterOptions {
  logger: LoggerService;
  config: RootConfigService;
  catalogService: CatalogService;
  authService: AuthService;
}

const ensureTrailingSlash = (url: string) =>
  url.endsWith('/') ? url : `${url}/`;

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, config, catalogService, authService } = options;

  const router = await createOpenApiRouter();
  router.use(express.json());

  router.get(
    '/namespaced-resources/:environment/results',
    async (request, response) => {
      // Get entityRef from params.
      const entityRef = decodeURIComponent(request.params.environment);

      const credentials = await authService.getOwnServiceCredentials();

      const entity = await catalogService.getEntityByRef(entityRef, {
        credentials,
      });

      if (!entity)
        return response.status(400).json({ error: 'Invalid entityRef' });

      const kyvernoEndpoint =
        entity?.metadata.annotations?.[KYVERNO_ENDPOINT_ANNOTATION];

      if (!kyvernoEndpoint)
        return response
          .status(400)
          .json({ error: `Entity missing 'kyverno.io/endpoint' annotation` });

      const uriTemplate = `v1/namespaced-resources/results{?sources*,namespaces*,kinds*,resources*,categories*,policies*,status*,severities*,search,labels*,page,offset,direction}`;

      const uri = parser.parse(uriTemplate).expand({
        ...request.query,
      });

      const policyResponse = await fetch(
        `${ensureTrailingSlash(kyvernoEndpoint)}${uri}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'GET',
        },
      );

      if (!policyResponse.ok) {
        return response.status(500).json({
          error: `Failed to fetch policies: ${policyResponse.statusText}`,
        });
      }

      const result = await policyResponse.json();

      return response.status(200).json(result);
    },
  );

  const middleware = MiddlewareFactory.create({ logger, config });

  router.use(middleware.error());
  return router;
}
