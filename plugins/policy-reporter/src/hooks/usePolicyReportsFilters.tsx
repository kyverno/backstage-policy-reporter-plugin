import qs from 'qs';
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
} from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Filter } from '@kyverno/backstage-plugin-policy-reporter-common';

export type PolicyReportsFiltersContextValue = {
  filter: Filter;
  updateFilter: (update: Partial<Filter>) => void;
  environment: string;
  setEnvironment: (entityRef: string) => void;
};

const PolicyReportsFiltersContext = createContext<
  PolicyReportsFiltersContextValue | undefined
>(undefined);

export type PolicyReportsFiltersProviderProps = PropsWithChildren<{
  /**
   * Default filter values written to the URL
   */
  defaultFilters?: Partial<Filter>;
  /**
   * The entityRef of the environment to use
   * when no ?environment= param is present in the URL.
   */
  defaultEnvironment: string;
}>;

/**
 * Provides shared filter state and selected environment for all policy report
 * filter components.
 */
export const PolicyReportsFiltersProvider = ({
  children,
  defaultFilters,
  defaultEnvironment,
}: PolicyReportsFiltersProviderProps) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const parsed = useMemo(
    () => qs.parse(searchParams.toString()),
    [searchParams],
  );

  const urlEnvironment = useMemo(
    () => parsed.environment?.toString(),
    [parsed],
  );

  // Use defaultFilters until the URL has been initialised (urlEnvironment set).
  // After that, always read from the URL so an explicit empty filter is valid.
  const filter = useMemo(
    () =>
      urlEnvironment ? ((parsed.filter ?? {}) as Filter) : defaultFilters ?? {},
    [parsed, urlEnvironment, defaultFilters],
  );

  const environment = useMemo(
    () => urlEnvironment ?? defaultEnvironment,
    [urlEnvironment, defaultEnvironment],
  );

  const updateParams = useCallback(
    (
      update:
        | Record<string, unknown>
        | ((prev: Record<string, unknown>) => Record<string, unknown>),
    ) => {
      setSearchParams(
        prev => {
          const prevParsed = qs.parse(prev.toString());
          const next =
            typeof update === 'function' ? update(prevParsed) : update;
          return qs.stringify(next, {
            arrayFormat: 'indices',
            skipNulls: true,
          });
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  useLayoutEffect(() => {
    if (!urlEnvironment) {
      updateParams({
        filter: defaultFilters,
        environment: defaultEnvironment,
      });
    }
    // setSearchParams isn't stable, hence disabling the exhaustive-deps check
    // for more info please visit https://github.com/remix-run/react-router/issues/9991
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultEnvironment, urlEnvironment, defaultFilters]);

  const updateFilter = useCallback(
    (update: Partial<Filter>) => {
      updateParams(prev => ({
        ...prev,
        filter: { ...(prev.filter as object), ...update },
      }));
    },
    [updateParams],
  );

  const setEnvironment = useCallback(
    (entityRef: string) => {
      updateParams(prev => ({ ...prev, environment: entityRef }));
    },
    [updateParams],
  );

  const value = useMemo(
    () => ({
      filter,
      updateFilter,
      environment,
      setEnvironment,
    }),
    [filter, updateFilter, environment, setEnvironment],
  );

  return (
    <PolicyReportsFiltersContext.Provider value={value}>
      {children}
    </PolicyReportsFiltersContext.Provider>
  );
};

/**
 * Hook for reading and updating policy report filters and the selected
 * environment. Must be used within a PolicyReportsFiltersProvider.
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
