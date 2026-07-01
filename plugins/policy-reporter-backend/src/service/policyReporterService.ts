import {
  AuthService,
  LoggerService,
  RootConfigService,
} from '@backstage/backend-plugin-api';
import * as parser from 'uri-template';
import {
  Filter,
  Pagination,
  ResultList,
} from '../schema/openapi/generated/models';
import { CatalogService } from '@backstage/plugin-catalog-node';
import {
  ForwardedError,
  InputError,
  NotFoundError,
  ServiceUnavailableError,
} from '@backstage/errors';
import { KYVERNO_ENDPOINT_ANNOTATION } from '@kyverno/backstage-plugin-policy-reporter-common';
import { JsonObject } from '@backstage/types';

export interface PolicyReporterApi {
  getNamespacedResourceResults(options: {
    entityRef: string;
    query: Filter & Pagination;
  }): Promise<ResultList>;

  getNamespaces(options: {
    entityRef: string;
    query: Pick<Filter, 'sources' | 'categories' | 'policies'>;
  }): Promise<string[]>;

  getSources(options: { entityRef: string }): Promise<string[]>;

  getKinds(options: {
    entityRef: string;
    query: Pick<Filter, 'sources' | 'kinds'>;
  }): Promise<string[]>;

  getCategories(options: {
    entityRef: string;
    query: Pick<Filter, 'sources' | 'namespaces'>;
  }): Promise<string[]>;

  getPolicies(options: {
    entityRef: string;
    query: Pick<Filter, 'sources' | 'namespaces' | 'categories'>;
  }): Promise<string[]>;
}

export class PolicyReporterService implements PolicyReporterApi {
  // TODO: Add testcase to verify that defaultHeaders property has expected values
  // Do we need a getter or update it to protected to validate this when testing ?
  private readonly defaultHeaders: Record<string, string>;

  constructor(
    private readonly deps: {
      logger: LoggerService;
      catalogService: CatalogService;
      authService: AuthService;
      configService: RootConfigService;
    },
  ) {
    // TODO: Add testcase to verify undefined headers doesnt break anything
    const headers = this.deps.configService
      .getOptionalConfig('policyReporter.headers')
      ?.get<JsonObject>();

    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...headers,
    };
  }

  async getNamespacedResourceResults(options: {
    entityRef: string;
    query: Filter & Pagination;
  }): Promise<ResultList> {
    const baseUrl = await this.getBaseUrl(options.entityRef);

    return this.request<ResultList>({
      baseUrl,
      uriTemplate:
        'v1/namespaced-resources/results{?sources*,namespaces*,kinds*,resources*,categories*,policies*,status*,severities*,search,labels*,page,offset,direction}',
      query: { ...options.query },
      operation: 'fetch namespaced resource results',
    });
  }

  async getNamespaces(options: {
    entityRef: string;
    query: Pick<Filter, 'sources' | 'categories' | 'policies'>;
  }): Promise<string[]> {
    const baseUrl = await this.getBaseUrl(options.entityRef);

    return this.request<string[]>({
      baseUrl,
      uriTemplate: 'v1/namespaces{?sources*,categories*,policies*}',
      query: { ...options.query },
      operation: 'fetch namespaces',
    });
  }

  async getSources(options: { entityRef: string }): Promise<string[]> {
    const baseUrl = await this.getBaseUrl(options.entityRef);

    return this.request<string[]>({
      baseUrl,
      uriTemplate: 'v1/namespaced-resources/sources',
      query: {},
      operation: 'fetch sources',
    });
  }

  async getKinds(options: {
    entityRef: string;
    query: Pick<Filter, 'sources' | 'namespaces'>;
  }): Promise<string[]> {
    const baseUrl = await this.getBaseUrl(options.entityRef);

    return this.request<string[]>({
      baseUrl,
      uriTemplate: 'v1/namespaced-resources/kinds{?sources*,namespaces*}',
      query: options.query,
      operation: 'fetch kinds',
    });
  }

  async getCategories(options: {
    entityRef: string;
    query: Pick<Filter, 'sources' | 'namespaces'>;
  }): Promise<string[]> {
    const baseUrl = await this.getBaseUrl(options.entityRef);

    return this.request<string[]>({
      baseUrl,
      uriTemplate: 'v1/namespaced-resources/categories{?sources*,namespaces*}',
      query: options.query,
      operation: 'fetch categories',
    });
  }

  async getPolicies(options: {
    entityRef: string;
    query: Pick<Filter, 'sources' | 'namespaces' | 'categories'>;
  }): Promise<string[]> {
    const baseUrl = await this.getBaseUrl(options.entityRef);

    return this.request<string[]>({
      baseUrl,
      uriTemplate:
        'v1/namespaced-resources/policies{?sources*,namespaces*,categories*}',
      query: options.query,
      operation: 'fetch policies',
    });
  }

  private async request<T>(options: {
    baseUrl: string;
    uriTemplate: string;
    query: Record<string, unknown>;
    operation: string;
  }): Promise<T> {
    const uri = parser.parse(options.uriTemplate).expand(options.query);
    const url = `${this.ensureTrailingSlash(options.baseUrl)}${uri}`;

    let response: Response;

    try {
      response = await fetch(url, {
        method: 'GET',
        headers: {
          ...this.defaultHeaders,
        },
      });
    } catch (error) {
      this.deps.logger.error(`Failed to ${options.operation} from ${url}`);
      throw new ServiceUnavailableError(
        `Failed to ${options.operation}`,
        error,
      );
    }

    if (!response.ok) {
      this.deps.logger.warn(
        `Policy Reporter returned ${response.status} ${response.statusText} for ${url}`,
      );

      throw new ForwardedError(
        `Failed to ${options.operation}: ${response.status} ${response.statusText}`,
        new Error(response.statusText),
      );
    }

    return (await response.json()) as T;
  }

  private ensureTrailingSlash(url: string): string {
    return url.endsWith('/') ? url : `${url}/`;
  }

  private async getBaseUrl(entityRef: string): Promise<string> {
    const credentials = await this.deps.authService.getOwnServiceCredentials();

    const entity = await this.deps.catalogService.getEntityByRef(entityRef, {
      credentials,
    });

    if (!entity) {
      throw new NotFoundError('Entity not found');
    }

    const baseUrl = entity.metadata.annotations?.[KYVERNO_ENDPOINT_ANNOTATION];

    if (!baseUrl) {
      throw new InputError(
        `Entity missing '${KYVERNO_ENDPOINT_ANNOTATION}' annotation`,
      );
    }

    return baseUrl;
  }
}
