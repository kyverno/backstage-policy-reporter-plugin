import {
  AuthService,
  LoggerService,
  RootConfigService,
} from '@backstage/backend-plugin-api';
import { CatalogService } from '@backstage/plugin-catalog-node';
import { KYVERNO_PLUGIN_VAP_ENDPOINT_ANNOTATION } from '@kyverno/backstage-plugin-policy-reporter-common';
import { PluginPolicy } from '../../../schema/openapi/generated/models';
import {
  fetchUpstream,
  getEntityEndpoint,
  getRequestHeaders,
} from '../../upstream';

export interface VapPluginApi {
  getVapPolicies(options: { entityRef: string }): Promise<PluginPolicy[]>;
}

/**
 * Service for the Policy Reporter ValidatingAdmissionPolicy (VAP) plugin API.
 * The VAP plugin is deployed separately from Policy Reporter, so it has its own
 * endpoint annotation and its own request headers.
 */
export class VapPluginService implements VapPluginApi {
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
      'policyReporter.plugins.vap.requestHeaders',
    );
  }

  async getVapPolicies(options: {
    entityRef: string;
  }): Promise<PluginPolicy[]> {
    const baseUrl = await getEntityEndpoint({
      catalogService: this.deps.catalogService,
      authService: this.deps.authService,
      entityRef: options.entityRef,
      annotation: KYVERNO_PLUGIN_VAP_ENDPOINT_ANNOTATION,
    });

    return fetchUpstream<PluginPolicy[]>({
      logger: this.deps.logger,
      upstreamName: 'Policy Reporter VAP plugin',
      baseUrl,
      uriTemplate: 'v1/policies',
      query: {},
      headers: this.defaultHeaders,
      operation: 'fetch validating admission policies',
    });
  }
}
