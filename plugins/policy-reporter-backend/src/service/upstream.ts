import {
  AuthService,
  LoggerService,
  RootConfigService,
} from '@backstage/backend-plugin-api';
import { CatalogService } from '@backstage/plugin-catalog-node';
import {
  ForwardedError,
  InputError,
  NotFoundError,
  ServiceUnavailableError,
} from '@backstage/errors';
import { JsonObject } from '@backstage/types';
import * as parser from 'uri-template';

/**
 * Builds the default headers for an upstream API from the request headers configured under the given config key
 */
export function getRequestHeaders(
  configService: RootConfigService,
  configKey: string,
): Record<string, string> {
  const headers = configService.getOptionalConfig(configKey)?.get<JsonObject>();

  return {
    'Content-Type': 'application/json',
    ...headers,
  };
}

/**
 * Resolves the base URL of an upstream API from an annotation on a catalog entity
 */
export async function getEntityEndpoint(options: {
  catalogService: CatalogService;
  authService: AuthService;
  entityRef: string;
  annotation: string;
}): Promise<string> {
  const credentials = await options.authService.getOwnServiceCredentials();

  const entity = await options.catalogService.getEntityByRef(
    options.entityRef,
    { credentials },
  );

  if (!entity) {
    throw new NotFoundError('Entity not found');
  }

  const baseUrl = entity.metadata.annotations?.[options.annotation];

  if (!baseUrl) {
    throw new InputError(`Entity missing '${options.annotation}' annotation`);
  }

  return baseUrl;
}

/**
 * Performs a GET request against an upstream API and maps failures to Backstage errors
 */
export async function fetchUpstream<T>(options: {
  logger: LoggerService;
  upstreamName: string;
  baseUrl: string;
  uriTemplate: string;
  query: Record<string, unknown>;
  headers: Record<string, string>;
  operation: string;
}): Promise<T> {
  const uri = parser.parse(options.uriTemplate).expand(options.query);
  const url = `${ensureTrailingSlash(options.baseUrl)}${uri}`;

  let response: Response;

  try {
    response = await fetch(url, {
      method: 'GET',
      headers: {
        ...options.headers,
      },
    });
  } catch (error) {
    options.logger.error(`Failed to ${options.operation} from ${url}`);
    throw new ServiceUnavailableError(`Failed to ${options.operation}`, error);
  }

  if (!response.ok) {
    options.logger.warn(
      `${options.upstreamName} returned ${response.status} ${response.statusText} for ${url}`,
    );

    throw new ForwardedError(
      `Failed to ${options.operation}: ${response.status} ${response.statusText}`,
      new Error(response.statusText),
    );
  }

  return (await response.json()) as T;
}

function ensureTrailingSlash(url: string): string {
  return url.endsWith('/') ? url : `${url}/`;
}
