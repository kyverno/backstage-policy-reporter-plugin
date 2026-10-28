import qs from 'qs';
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from 'react';
import { useSearchParams } from 'react-router-dom';

export type EnvironmentContextValue = {
  environment: string;
  setEnvironment: (entityRef: string) => void;
};

const EnvironmentContext = createContext<EnvironmentContextValue | undefined>(
  undefined,
);

export type EnvironmentProviderProps = PropsWithChildren<{
  /**
   * The entityRef of the environment to use
   * when no ?environment= param is present in the URL.
   */
  defaultEnvironment: string;
}>;

/**
 * Provides the selected environment, stored in the ?environment= URL param.
 * It never writes to the URL on mount, so it can be combined with providers
 * that initialise the URL themselves, such as PolicyReportsFiltersProvider.
 */
export const EnvironmentProvider = ({
  children,
  defaultEnvironment,
}: EnvironmentProviderProps) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const urlEnvironment = useMemo(
    () => qs.parse(searchParams.toString()).environment?.toString(),
    [searchParams],
  );

  const environment = urlEnvironment ?? defaultEnvironment;

  // setSearchParams is not stable (https://github.com/remix-run/react-router/issues/9991),
  // so we hold it in a ref to keep setEnvironment stable across renders.
  const setSearchParamsRef = useRef(setSearchParams);
  setSearchParamsRef.current = setSearchParams;

  const setEnvironment = useCallback((entityRef: string) => {
    setSearchParamsRef.current(
      prev =>
        qs.stringify(
          { ...qs.parse(prev.toString()), environment: entityRef },
          { arrayFormat: 'indices', skipNulls: true },
        ),
      { replace: true },
    );
  }, []);

  const value = useMemo(
    () => ({ environment, setEnvironment }),
    [environment, setEnvironment],
  );

  return (
    <EnvironmentContext.Provider value={value}>
      {children}
    </EnvironmentContext.Provider>
  );
};

/**
 * Hook for reading and updating the selected environment.
 * Must be used within an EnvironmentProvider.
 */
export const useEnvironment = (): EnvironmentContextValue => {
  const ctx = useContext(EnvironmentContext);
  if (!ctx) {
    throw new Error('useEnvironment must be used within EnvironmentProvider');
  }
  return ctx;
};
