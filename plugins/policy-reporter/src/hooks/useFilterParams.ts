import qs from 'qs';
import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Filter } from '@kyverno/backstage-plugin-policy-reporter-common';

export const useFilterParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const filter = (qs.parse(searchParams.toString()).filter ?? {}) as Filter;

  const setFilter = useCallback(
    (updater: (prev: Filter) => Filter) => {
      setSearchParams(
        prev => {
          const parsed = qs.parse(prev.toString());
          const next = updater((parsed.filter ?? {}) as Filter);
          // Drop empty/undefined values so the URL stays clean
          const clean = Object.fromEntries(
            Object.entries(next).filter(
              ([, v]) =>
                v !== undefined &&
                v !== '' &&
                !(Array.isArray(v) && v.length === 0),
            ),
          );
          return qs.stringify(
            {
              ...parsed,
              filter: Object.keys(clean).length ? clean : undefined,
            },
            { arrayFormat: 'brackets', skipNulls: true },
          );
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  return { filter, setFilter };
};
