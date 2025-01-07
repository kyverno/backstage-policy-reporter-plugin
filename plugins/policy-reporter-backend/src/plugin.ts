import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './service/router';
import { catalogServiceRef } from '@backstage/plugin-catalog-node';

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
        httpRouter.use(
          await createRouter({
            logger,
            config,
            catalogService,
            authService,
          }),
        );
      },
    });
  },
});
