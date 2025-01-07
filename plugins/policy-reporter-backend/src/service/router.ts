import { AuthService, RootConfigService } from '@backstage/backend-plugin-api';
import { LoggerService } from '@backstage/backend-plugin-api';
import express from 'express';
import Router from 'express-promise-router';
import {
  KYVERNO_ENDPOINT_ANNOTATION,
  Severity,
  Status,
} from 'backstage-plugin-policy-reporter-common';
import { MiddlewareFactory } from '@backstage/backend-defaults/rootHttpRouter';
import { CatalogService } from '@backstage/plugin-catalog-node';

export interface RouterOptions {
  logger: LoggerService;
  config: RootConfigService;
  catalogService: CatalogService;
  authService: AuthService;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, config, catalogService, authService } = options;

  const router = Router();
  router.use(express.json());

  router.get(
    '/namespaced-resources/:environment/results',
    async (request, response) => {
      // Decided to inline for now
      // Could be refactored to use a generated typed express router from OpenAPI spec
      type QueryParams = {
        sources?: string[] | string; // Filter by a list of sources
        namespaces?: string[] | string; // Filter by a list of namespaces
        kinds?: string[] | string; // Filter by a list of kinds
        resources?: string[] | string; // Filter by a list of resources
        categories?: string[] | string; // Filter by a list of categories
        policies?: string[] | string; // Filter by a list of policies
        status?: Status[] | Status; // Filter by a list of status (fail, pass, warn, error, skip)
        severities?: Severity[] | Severity; // Filter by a list of severities (low, medium, high)
        search?: string; // Filter by search string
        labels?: string[] | string; // Filter by polr label-value pairs
        page?: string; // Requested List Page
        offset?: string; // Results per Page
        direction?: 'asc' | 'desc'; // Order of the results
      };

      const query: QueryParams = request.query;

      // Append query parameters from the request to the external API call
      const urlParams = new URLSearchParams();

      // Iterate over the query parameters
      for (const [key, value] of Object.entries(query)) {
        if (Array.isArray(value)) {
          // If the value is an array, append each item as a string
          value.forEach(val => urlParams.append(key, val));
        } else if (value) {
          urlParams.append(key, value);
        }
      }

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

      const policyResponse = await fetch(
        `${kyvernoEndpoint}v1/namespaced-resources/results?${urlParams.toString()}`,
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
