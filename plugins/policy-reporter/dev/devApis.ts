/**
 * The two fake APIs that let the plugin run with no backend.
 *
 * `toastApiRef` is the only other API the plugin reads, and it is a `core.*`
 * ref owned by the app plugin that `createDevApp` already provides — providing
 * it again would be rejected with `API_FACTORY_CONFLICT`.
 */
import {
  ApiBlueprint,
  createFrontendModule,
} from '@backstage/frontend-plugin-api';
import { InMemoryCatalogClient } from '@backstage/catalog-client/testUtils';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { DefaultApiClient } from '@kyverno/backstage-plugin-policy-reporter-common';
import { policyReporterApiRef } from '../src/api';
import { mockEntities } from './mock/fixtures';
import { mockFetch } from './mock/fetch';

export const devApis = createFrontendModule({
  pluginId: 'policy-reporter',
  extensions: [
    /**
     * No `name`, so this takes the id `api:policy-reporter` — the same id the
     * plugin's own API extension gets, since that one takes no name either.
     * Installing this module after the plugin therefore replaces the real
     * client, which is why `features` order matters in index.tsx.
     *
     * The real `DefaultApiClient` is kept and only its `fetch` is swapped, so
     * the generated query-string building still runs against the fixtures.
     */
    ApiBlueprint.make({
      params: defineParams =>
        defineParams({
          api: policyReporterApiRef,
          deps: {},
          factory: () =>
            new DefaultApiClient({
              // Only used to build a URL that mockFetch parses; nothing is sent.
              discoveryApi: { getBaseUrl: async () => 'http://mock.local' },
              fetchApi: { fetch: mockFetch },
            }),
        }),
    }),
  ],
});

/**
 * The catalog API, served from memory by Backstage's own `InMemoryCatalogClient`.
 *
 * It implements the whole `CatalogApi` — including the `CATALOG_FILTER_EXISTS`
 * filter that `useEnvironments` relies on to find clusters by annotation, and
 * the index-aligned `getEntitiesByRefs` that `useEntityEnvironment` walks — so
 * there is nothing to hand-roll and the real catalog entity page works too.
 * It comes from `@backstage/catalog-client`, already a runtime dependency.
 *
 * This is a separate module because `catalogApiRef` is `plugin.catalog.service`
 * and therefore owned by the catalog plugin: provided from a `policy-reporter`
 * module it would lose to the real `CatalogClient` with an
 * `API_FACTORY_CONFLICT`, and the dev app would start reaching for a backend.
 */
export const devCatalogApi = createFrontendModule({
  pluginId: 'catalog',
  extensions: [
    ApiBlueprint.make({
      name: 'dev-in-memory',
      params: defineParams =>
        defineParams({
          api: catalogApiRef,
          deps: {},
          factory: () => new InMemoryCatalogClient({ entities: mockEntities }),
        }),
    }),
  ],
});
