import qs from 'qs';
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Filter } from '@kyverno/backstage-plugin-policy-reporter-common';

export type PolicyReportsFiltersContextValue = {
  filter: Filter;
  updateFilter: (update: Partial<Filter>) => void;
  environment: string | undefined;
  setEnvironment: (entityRef: string) => void;
};

const PolicyReportsFiltersContext = createContext<
  PolicyReportsFiltersContextValue | undefined
>(undefined);

export type PolicyReportsFiltersProviderProps = PropsWithChildren<{
  /**
   * Default filter values written to the URL
   */
  defaults?: Partial<Filter>;
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
  defaults,
  defaultEnvironment,
}: PolicyReportsFiltersProviderProps) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const filter = useMemo(
    () => (qs.parse(searchParams.toString()).filter ?? {}) as Filter,
    [searchParams],
  );

  const environment = useMemo(
    () => qs.parse(searchParams.toString()).environment?.toString(),
    [searchParams],
  );

  const updateParams = useCallback(
    (
      update:
        | Record<string, unknown>
        | ((prev: Record<string, unknown>) => Record<string, unknown>),
    ) => {
      setSearchParams(
        prev => {
          const parsed = qs.parse(prev.toString());
          const next = typeof update === 'function' ? update(parsed) : update;
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

  useEffect(() => {
    if (!environment) {
      updateParams({ filter: defaults, environment: defaultEnvironment });
    }
  }, [defaultEnvironment, environment, updateParams, defaults]);

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
