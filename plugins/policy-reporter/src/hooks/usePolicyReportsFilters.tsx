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

/**
 * The value exposed by PolicyReportsFiltersProvider.
 *
 * Future extension: add `environment` here once environment selection is moved
 * into the provider (follow-up PR).
 */
export type PolicyReportsFiltersContextValue = {
  filter: Filter;
  updateFilter: (
    update: Partial<Filter> | ((prev: Filter) => Partial<Filter>),
  ) => void;
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
}>;

/**
 * Provides a shared filter state for all policy report filter components.
 *
 * - Holds a single URL subscription via useSearchParams / useLocation.
 * - Filter state is initialised synchronously: from the URL if params exist,
 *   otherwise from the `defaults` prop.
 * - Defaults are written to the URL on mount so bookmarks and sharing work.
 * - External URL changes (back/forward, nav links) are synced into state.
 * - Internal filter updates write to the URL via setSearchParams.
 */
export const PolicyReportsFiltersProvider = ({
  children,
  defaults,
}: PolicyReportsFiltersProviderProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  const [filterState, setFilterState] = useState<Filter>(() => {
    const fromUrl = parseFilterFromSearch(searchParams.toString());
    if (Object.keys(fromUrl).length > 0) return fromUrl;
    return cleanFilter(defaults ?? {}) as Filter;
  });

  // Write defaults to the URL on mount when the URL contained no filter.
  // Runs once so that the initial state is bookmarkable.
  useEffect(() => {
    const fromUrl = parseFilterFromSearch(searchParams.toString());
    if (
      Object.keys(fromUrl).length === 0 &&
      Object.keys(filterState).length > 0
    ) {
      setSearchParams(
        prev => stringifyWithFilter(prev.toString(), filterState),
        { replace: true },
      );
    }
    // Intentionally run only on mount — searchParams / filterState are stable
    // at this point and we do not want this to re-run on updates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync state when the URL changes externally (browser back/forward, nav links).
  // The isEqual guard prevents spurious updates when we wrote the URL ourselves.
  useEffect(() => {
    const urlFilter = parseFilterFromSearch(location.search);
    setFilterState(prev => (isEqual(prev, urlFilter) ? prev : urlFilter));
  }, [location.search]);

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

  const value = useMemo(
    () => ({ filter: filterState, updateFilter }),
    [filterState, updateFilter],
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
