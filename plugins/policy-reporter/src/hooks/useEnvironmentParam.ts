import qs from 'qs';
import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Reads and writes the selected environment as `?environment=<entityRef>` in the URL.
 *
 * This hook is a pure read/write primitive. The responsibility for writing the
 * initial default value belongs to the top-level page components, which have
 * access to the loaded environments list and can handle the loading/error states
 * before any child component renders.
 */
export const useEnvironmentParam = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const environment = useMemo(() => {
    const raw = qs.parse(searchParams.toString()).environment;
    return typeof raw === 'string' ? raw : undefined;
  }, [searchParams]);

  const setEnvironment = useCallback(
    (entityRef: string) => {
      setSearchParams(
        prev => {
          const parsed = qs.parse(prev.toString());
          return qs.stringify({ ...parsed, environment: entityRef });
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  return { environment, setEnvironment };
};
