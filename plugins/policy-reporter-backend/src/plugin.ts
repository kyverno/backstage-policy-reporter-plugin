import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './service/router';
import { catalogServiceRef } from '@backstage/plugin-catalog-node';
import { PolicyReporterService } from './service/policyReporterService';
import { PluginPolicyService } from './service/plugins/pluginPolicyService';
import { TRIVY_PLUGIN, VAP_PLUGIN } from './service/plugins/descriptors';

/**
 * kyvernoPolicyReportsPlugin backend plugin
 *
 * @public
 */
export const kyvernoPolicyReportsPlugin = createBackendPlugin({
  pluginId: 'policy-reporter',
  register(env) {
    env.registerInit({
      deps: {
        httpRouter: coreServices.httpRouter,
        logger: coreServices.logger,
        config: coreServices.rootConfig,
        catalogService: catalogServiceRef,
        authService: coreServices.auth,
      },
      async init({ httpRouter, logger, config, catalogService, authService }) {
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

        httpRouter.use(
          await createRouter({
            logger,
            config,
            policyReporterService,
            vapPluginService,
            trivyPluginService,
          }),
        );
      },
    });
  },
});
