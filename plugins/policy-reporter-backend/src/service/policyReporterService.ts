import {
  AuthService,
  LoggerService,
  RootConfigService,
} from '@backstage/backend-plugin-api';
import {
  Filter,
  Pagination,
  ResultList,
} from '../schema/openapi/generated/models';
import { CatalogService } from '@backstage/plugin-catalog-node';
import { KYVERNO_ENDPOINT_ANNOTATION } from '@kyverno/backstage-plugin-policy-reporter-common';
import {
  fetchUpstream,
  getEntityEndpoint,
  getRequestHeaders,
} from './upstream';

export interface PolicyReporterApi {
  getNamespacedResourceResults(options: {
    entityRef: string;
    query: Filter & Pagination;
  }): Promise<ResultList>;

  getClusterResourceResults(options: {
    entityRef: string;
    query: Pick<
      Filter,
      | 'sources'
      | 'kinds'
      | 'categories'
      | 'policies'
      | 'status'
      | 'severities'
      | 'search'
      | 'labels'
    > &
      Pagination;
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

  getClusterSources(options: { entityRef: string }): Promise<string[]>;

  getClusterKinds(options: {
    entityRef: string;
    query: Pick<Filter, 'sources' | 'namespaces'>;
  }): Promise<string[]>;

  getClusterCategories(options: {
    entityRef: string;
    query: Pick<Filter, 'sources'>;
  }): Promise<string[]>;

  getClusterPolicies(options: {
    entityRef: string;
    query: Pick<Filter, 'sources' | 'categories'>;
  }): Promise<string[]>;
}

export class PolicyReporterService implements PolicyReporterApi {
  private readonly defaultHeaders: Record<string, string>;

  constructor(
    private readonly deps: {
      logger: LoggerService;
      catalogService: CatalogService;
      authService: AuthService;
      configService: RootConfigService;
    },
  ) {
    this.defaultHeaders = getRequestHeaders(
      this.deps.configService,
      'policyReporter.requestHeaders',
    );
  }

  async getClusterResourceResults(options: {
    entityRef: string;
    query: Pick<
      Filter,
      | 'sources'
      | 'kinds'
      | 'categories'
      | 'policies'
      | 'status'
      | 'severities'
      | 'search'
      | 'labels'
    > &
      Pagination;
  }): Promise<ResultList> {
    const baseUrl = await this.getBaseUrl(options.entityRef);

    return this.request<ResultList>({
      baseUrl,
      uriTemplate:
        'v1/cluster-resources/results{?sources*,kinds*,categories*,policies*,status*,severities*,search,labels*,page,offset,direction}',
      query: { ...options.query },
      operation: 'fetch cluster resource results',
    });
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

  async getClusterSources(options: { entityRef: string }): Promise<string[]> {
    const baseUrl = await this.getBaseUrl(options.entityRef);

    return this.request<string[]>({
      baseUrl,
      uriTemplate: 'v1/cluster-resources/sources',
      query: {},
      operation: 'fetch cluster sources',
    });
  }

  async getClusterKinds(options: {
    entityRef: string;
    query: Pick<Filter, 'sources' | 'namespaces'>;
  }): Promise<string[]> {
    const baseUrl = await this.getBaseUrl(options.entityRef);

    return this.request<string[]>({
      baseUrl,
      uriTemplate: 'v1/cluster-resources/kinds{?sources*,namespaces*}',
      query: options.query,
      operation: 'fetch cluster kinds',
    });
  }

  async getClusterCategories(options: {
    entityRef: string;
    query: Pick<Filter, 'sources'>;
  }): Promise<string[]> {
    const baseUrl = await this.getBaseUrl(options.entityRef);

    return this.request<string[]>({
      baseUrl,
      uriTemplate: 'v1/cluster-resources/categories{?sources*}',
      query: options.query,
      operation: 'fetch cluster categories',
    });
  }

  async getClusterPolicies(options: {
    entityRef: string;
    query: Pick<Filter, 'sources' | 'categories'>;
  }): Promise<string[]> {
    const baseUrl = await this.getBaseUrl(options.entityRef);

    return this.request<string[]>({
      baseUrl,
      uriTemplate: 'v1/cluster-resources/policies{?sources*,categories*}',
      query: options.query,
      operation: 'fetch cluster policies',
    });
  }

  private async request<T>(options: {
    baseUrl: string;
    uriTemplate: string;
    query: Record<string, unknown>;
    operation: string;
  }): Promise<T> {
    return fetchUpstream<T>({
      ...options,
      logger: this.deps.logger,
      upstreamName: 'Policy Reporter',
      headers: this.defaultHeaders,
    });
  }

  private async getBaseUrl(entityRef: string): Promise<string> {
    return getEntityEndpoint({
      catalogService: this.deps.catalogService,
      authService: this.deps.authService,
      entityRef,
      annotation: KYVERNO_ENDPOINT_ANNOTATION,
    });
  }
}
