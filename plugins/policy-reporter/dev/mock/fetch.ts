/**
 * A fake `fetch` for the offline dev app.
 *
 * Injected as the `fetchApi` of the real `DefaultApiClient` rather than
 * replacing the client, so the generated URI-template expansion still runs and
 * the fixtures are served over the same wire contract as the backend. Paths
 * below are copied from the client's `uriTemplate` literals.
 *
 * Callers read `response.ok`/`.status` and call `.json()` themselves, so these
 * must be real `Response` objects.
 */
import type {
  ListResult,
  RequestError,
  ResultList,
} from '@kyverno/backstage-plugin-policy-reporter-common';
import { datasetFor, type MockDataset } from './fixtures';

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/** An empty selection means "not filtering on this field". */
const allows = (params: URLSearchParams, key: string, value: string) => {
  const selected = params.getAll(key);
  return selected.length === 0 || selected.includes(value);
};

/**
 * Results are filtered for real, so changing a filter visibly changes the
 * table. `source` and `category` are read out of `properties`, which is where
 * they live on the wire.
 *
 * `labels` is the one query param not applied: `ListResult` carries no labels
 * to match against. No dropdown sets it, so only a hand-written URL can ask
 * for it, and such a request comes back unfiltered on that field.
 *
 * The filter *dropdowns* are not narrowed by each other (see `options` below)
 * — cascading them is realism this dev app does not need.
 */
function filterResults(
  results: ListResult[],
  params: URLSearchParams,
): ListResult[] {
  const search = params.get('search')?.toLowerCase();

  return results.filter(
    result =>
      allows(params, 'sources', result.properties.source) &&
      allows(params, 'namespaces', result.namespace) &&
      allows(params, 'kinds', result.kind) &&
      // Upstream matches `resources` on the resource name.
      allows(params, 'resources', result.name) &&
      allows(params, 'categories', result.properties.category) &&
      allows(params, 'policies', result.policy) &&
      allows(params, 'status', result.status) &&
      allows(params, 'severities', result.severity) &&
      (!search ||
        [result.name, result.policy, result.kind, result.namespace].some(
          field => field.toLowerCase().includes(search),
        )),
  );
}

/** `page` is 1-indexed and `offset` is the page size, per PolicyReportsTable. */
function paginate(results: ListResult[], params: URLSearchParams): ResultList {
  const sorted = [...results].sort((a, b) =>
    params.get('direction') === 'asc'
      ? a.timestamp - b.timestamp
      : b.timestamp - a.timestamp,
  );
  const page = Number(params.get('page'));
  const pageSize = Number(params.get('offset'));

  if (!page || !pageSize) {
    return { items: sorted, count: sorted.length };
  }

  const start = (page - 1) * pageSize;
  return {
    items: sorted.slice(start, start + pageSize),
    count: sorted.length,
  };
}

/** Distinct, sorted values across the whole dataset. */
const options = (results: ListResult[], pick: (r: ListResult) => string) =>
  Array.from(new Set(results.map(pick).filter(Boolean))).sort();

/**
 * Keyed by the exact paths the generated client builds. Each handler takes the
 * whole dataset and picks the part it serves, so the namespaced, cluster and
 * VAP routes all read the same way.
 *
 * `/namespaced-resources/results` is the one route without a `/v1` prefix;
 * that matches the backend router, so it is reproduced rather than corrected.
 */
const ROUTES: Record<
  string,
  (dataset: MockDataset, params: URLSearchParams) => unknown
> = {
  // Only the results routes apply the filters; the option routes list the whole
  // dataset so one dropdown never narrows another.
  '/namespaced-resources/results': (d, p) =>
    paginate(filterResults(d.namespacedResults, p), p),
  '/v1/cluster-resources/results': (d, p) =>
    paginate(filterResults(d.clusterResults, p), p),

  '/v1/namespaces': d => options(d.namespacedResults, r => r.namespace),
  '/v1/namespaced-resources/sources': d =>
    options(d.namespacedResults, r => r.properties.source),
  '/v1/namespaced-resources/kinds': d =>
    options(d.namespacedResults, r => r.kind),
  '/v1/namespaced-resources/categories': d =>
    options(d.namespacedResults, r => r.properties.category),
  '/v1/namespaced-resources/policies': d =>
    options(d.namespacedResults, r => r.policy),

  '/v1/cluster-resources/sources': d =>
    options(d.clusterResults, r => r.properties.source),
  '/v1/cluster-resources/kinds': d => options(d.clusterResults, r => r.kind),
  '/v1/cluster-resources/categories': d =>
    options(d.clusterResults, r => r.properties.category),
  '/v1/cluster-resources/policies': d =>
    options(d.clusterResults, r => r.policy),

  '/plugins/vap/v1/policies': d => d.vapPolicies,
};

/** The generated client always passes a string, but cover the whole signature. */
function resolveUrl(input: RequestInfo | URL): URL {
  if (typeof input === 'string') {
    return new URL(input);
  }
  if (input instanceof URL) {
    return new URL(input.href);
  }
  return new URL(input.url);
}

export const mockFetch = async (
  input: RequestInfo | URL,
): Promise<Response> => {
  const url = resolveUrl(input);
  const params = url.searchParams;

  const environment = params.get('environment');
  if (!environment) {
    return json({ error: 'Missing environment' } as RequestError, 400);
  }

  const handler = ROUTES[url.pathname];
  if (!handler) {
    // 404 rather than an empty list, so an endpoint added to openapi.yaml but
    // not to this mock fails loudly instead of rendering as "no data".
    return json(
      {
        error: `No mock handler for ${url.pathname}. Add one in dev/mock/fetch.ts.`,
      } as RequestError,
      404,
    );
  }

  return json(handler(datasetFor(environment), params));
};
