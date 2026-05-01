import qs from 'qs';
import isEqual from 'lodash/isEqual';
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import type { Filter } from '@kyverno/backstage-plugin-policy-reporter-common';

export type PolicyReportsFiltersContextValue = {
  filter: Filter;
  updateFilter: (
    update: Partial<Filter> | ((prev: Filter) => Partial<Filter>),
  ) => void;
  environment: string | undefined;
  setEnvironment: (entityRef: string) => void;
};

const PolicyReportsFiltersContext = createContext<
  PolicyReportsFiltersContextValue | undefined
>(undefined);

const cleanFilter = (filter: Partial<Filter>): Partial<Filter> =>
  Object.fromEntries(
    Object.entries(filter).filter(
      ([, v]) =>
        v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0),
    ),
  );

const parseFilterFromSearch = (search: string): Filter =>
  (qs.parse(search, { ignoreQueryPrefix: true }).filter ?? {}) as Filter;

const parseEnvironmentFromSearch = (search: string): string | undefined => {
  const raw = qs.parse(search, { ignoreQueryPrefix: true }).environment;
  return typeof raw === 'string' ? raw : undefined;
};

const stringifyWithFilterAndEnvironment = (
  currentSearch: string,
  filter: Partial<Filter>,
  environment: string | undefined,
): string => {
  const parsed = qs.parse(currentSearch, { ignoreQueryPrefix: true });
  return qs.stringify(
    {
      ...parsed,
      filter: Object.keys(filter).length ? filter : undefined,
      environment: environment ?? parsed.environment,
    },
    { arrayFormat: 'indices', skipNulls: true },
  );
};

const stringifyWithFilter = (
  currentSearch: string,
  filter: Partial<Filter>,
): string => {
  const parsed = qs.parse(currentSearch, { ignoreQueryPrefix: true });
  return qs.stringify(
    { ...parsed, filter: Object.keys(filter).length ? filter : undefined },
    { arrayFormat: 'indices', skipNulls: true },
  );
};

export type PolicyReportsFiltersProviderProps = PropsWithChildren<{
  /**
   * Default filter values applied when no filter is present in the URL.
   * Useful for setting initial states like `{ status: ['fail'] }` or
   * annotation-derived values on entity pages.
   */
  defaults?: Partial<Filter>;
  /**
   * The entityRef of the environment to select when no `?environment=` param
   * is present in the URL. Page components pass `environments[0].entityRef`
   * here — they only render the provider after the environments list has loaded
   * and is known to be non-empty, so this value is always a real string.
   */
  defaultEnvironment?: string;
}>;

/**
 * Provides a shared filter state and selected environment for all policy
 * report filter components.
 *
 * - Holds a single URL subscription via useSearchParams / useLocation.
 * - Filter state is initialised synchronously: from the URL if params exist,
 *   otherwise from the `defaults` prop.
 * - Environment is initialised synchronously: from the URL if present,
 *   otherwise from the `defaultEnvironment` prop.
 * - Both defaults are written to the URL whenever they are absent
 *   (on mount, on back/forward navigation to a bare route, or when defaults
 *   change while no URL params are active).
 * - External URL changes (back/forward, nav links) are synced into state.
 * - Internal updates write to the URL via setSearchParams.
 */
export const PolicyReportsFiltersProvider = ({
  children,
  defaults,
  defaultEnvironment,
}: PolicyReportsFiltersProviderProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  // Memoize cleaned defaults so they can be a stable effect dependency.
  const cleanedDefaults = useMemo(
    () => cleanFilter(defaults ?? {}) as Filter,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(defaults)],
  );

  const [filterState, setFilterState] = useState<Filter>(() => {
    const fromUrl = parseFilterFromSearch(searchParams.toString());
    if (Object.keys(fromUrl).length > 0) return fromUrl;
    return cleanedDefaults;
  });

  const [environmentState, setEnvironmentState] = useState<string | undefined>(
    () =>
      parseEnvironmentFromSearch(searchParams.toString()) ?? defaultEnvironment,
  );

  // Sync state when the URL changes externally (browser back/forward, nav links)
  // and when defaults change while no filter/environment is present in the URL.
  //
  // When the URL has no filter/environment params, fall back to defaults and
  // write them back so the state stays bookmarkable.
  //
  // The isEqual guard prevents spurious updates when we wrote the URL ourselves.
  useEffect(() => {
    const urlFilter = parseFilterFromSearch(location.search);
    const urlEnvironment = parseEnvironmentFromSearch(location.search);

    const resolvedFilter =
      Object.keys(urlFilter).length > 0 ? urlFilter : cleanedDefaults;
    const resolvedEnvironment = urlEnvironment ?? defaultEnvironment;

    setFilterState(prev =>
      isEqual(prev, resolvedFilter) ? prev : resolvedFilter,
    );
    setEnvironmentState(prev =>
      prev === resolvedEnvironment ? prev : resolvedEnvironment,
    );

    const needsFilterWrite =
      Object.keys(urlFilter).length === 0 &&
      Object.keys(resolvedFilter).length > 0;
    const needsEnvironmentWrite = !urlEnvironment && resolvedEnvironment;

    if (needsFilterWrite || needsEnvironmentWrite) {
      setSearchParams(
        prev =>
          stringifyWithFilterAndEnvironment(
            prev.toString(),
            needsFilterWrite
              ? resolvedFilter
              : parseFilterFromSearch(prev.toString()),
            needsEnvironmentWrite ? resolvedEnvironment : undefined,
          ),
        { replace: true },
      );
    }
  }, [location.search, cleanedDefaults, defaultEnvironment, setSearchParams]);

  const updateFilter = useCallback(
    (update: Partial<Filter> | ((prev: Filter) => Partial<Filter>)) => {
      setFilterState(prev => {
        const partial = typeof update === 'function' ? update(prev) : update;
        const next = cleanFilter({ ...prev, ...partial }) as Filter;
        if (isEqual(prev, next)) return prev;

        setSearchParams(
          current => stringifyWithFilter(current.toString(), next),
          { replace: true },
        );

        return next;
      });
    },
    [setSearchParams],
  );

  const setEnvironment = useCallback(
    (entityRef: string) => {
      setEnvironmentState(entityRef);
      setSearchParams(
        prev => {
          const parsed = qs.parse(prev.toString());
          return qs.stringify(
            { ...parsed, environment: entityRef },
            { arrayFormat: 'indices', skipNulls: true },
          );
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const value = useMemo(
    () => ({
      filter: filterState,
      updateFilter,
      environment: environmentState,
      setEnvironment,
    }),
    [filterState, updateFilter, environmentState, setEnvironment],
  );

  return (
    <PolicyReportsFiltersContext.Provider value={value}>
      {children}
    </PolicyReportsFiltersContext.Provider>
  );
};

/**
 * Hook for reading and updating policy report filters.
 * Must be used within a {@link PolicyReportsFiltersProvider}.
 */
export const usePolicyReportsFilters = (): PolicyReportsFiltersContextValue => {
  const ctx = useContext(PolicyReportsFiltersContext);
  if (!ctx) {
    throw new Error(
      'usePolicyReportsFilters must be used within PolicyReportsFiltersProvider',
    );
  }
  return ctx;
};
