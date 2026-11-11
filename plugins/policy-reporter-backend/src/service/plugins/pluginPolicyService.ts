import {
  AuthService,
  LoggerService,
  RootConfigService,
} from '@backstage/backend-plugin-api';
import { CatalogService } from '@backstage/plugin-catalog-node';
import { PluginPolicy } from '../../schema/openapi/generated/models';
import {
  fetchUpstream,
  getEntityEndpoint,
  getRequestHeaders,
} from '../upstream';

export interface PluginDescriptor {
  // The catalog annotation holding the plugin API base URL
  annotation: string;
  // The config key holding the outbound request headers for the plugin API
  configKey: string;
  // The plugin name used in log messages and error messages
  displayName: string;
}

export interface PluginPolicyApi {
  listPolicies(options: {
    entityRef: string;
    group?: string;
  }): Promise<PluginPolicy[]>;
}

// The route group every plugin serves its primary policies under
const DEFAULT_ROUTE_GROUP = 'v1';

/**
 * Service for a Policy Reporter plugin API.
 *
 * Every plugin implements the same upstream contract, so one service serves all
 * of them and a new plugin is a {@link PluginDescriptor} rather than a new class.
 */
export class PluginPolicyService implements PluginPolicyApi {
  private readonly defaultHeaders: Record<string, string>;

  constructor(
    private readonly deps: {
      logger: LoggerService;
      catalogService: CatalogService;
      authService: AuthService;
      configService: RootConfigService;
      descriptor: PluginDescriptor;
    },
  ) {
    this.defaultHeaders = getRequestHeaders(
      this.deps.configService,
      this.deps.descriptor.configKey,
    );
  }

  /**
   * Lists the policies of one route group of the plugin API.
   *
   * The group is a parameter rather than part of the descriptor because a single
   * plugin may serve several groups behind one base URL: the Kyverno plugin
   * serves `v1`, `vpol/v1` and `ivpol/v1`. Keep it a parameter.
   */
  async listPolicies(options: {
    entityRef: string;
    group?: string;
  }): Promise<PluginPolicy[]> {
    const { descriptor } = this.deps;
    const group = options.group ?? DEFAULT_ROUTE_GROUP;

    const baseUrl = await getEntityEndpoint({
      catalogService: this.deps.catalogService,
      authService: this.deps.authService,
      entityRef: options.entityRef,
      annotation: descriptor.annotation,
    });

    return fetchUpstream<PluginPolicy[]>({
      logger: this.deps.logger,
      upstreamName: descriptor.displayName,
      baseUrl,
      uriTemplate: `${group}/policies`,
      query: {},
      headers: this.defaultHeaders,
      operation: `fetch ${descriptor.displayName} policies`,
    });
  }
}
