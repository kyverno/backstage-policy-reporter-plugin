/**
 * Offline dev app, for screenshots and reviewing frontend changes locally.
 *
 * Runs the new frontend system plugin from `src/alpha` with no Backstage
 * backend, no cluster and no network. The catalog plugin is installed so the
 * entity page renders with its real header and tab bar, which is what the
 * published screenshots show; both it and the plugin read from the fixtures in
 * `dev/mock`. Pick the `empty` environment in the plugin's own dropdown to see
 * the empty states. See DEVELOPMENT.md.
 */
import { createDevApp } from '@backstage/frontend-dev-utils';
import catalogPlugin from '@backstage/plugin-catalog/alpha';
import policyReporterPlugin from '../src/alpha';
import { devApis, devCatalogApi } from './devApis';

createDevApp({
  // Order matters. devApis declares `api:policy-reporter`, the same extension
  // id the plugin's own API extension uses, and devCatalogApi overrides the
  // catalog plugin's real client; the later feature wins in both cases. The
  // other way round the app would try to reach a backend.
  features: [catalogPlugin, policyReporterPlugin, devApis, devCatalogApi],
});
