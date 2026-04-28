import qs from 'qs';
import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Filter } from '@kyverno/backstage-plugin-policy-reporter-common';
import { useEffectOnce } from 'react-use';

/**
 * Strips empty, blank, and empty-array values from a filter object so the URL stays clean.
 *
 * @param filter - The filter object to clean.
 * @returns A new filter object with all empty values removed.
 */
const cleanFilter = (filter: Partial<Filter>): Partial<Filter> =>
  Object.fromEntries(
    Object.entries(filter).filter(
      ([, v]) =>
        v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0),
    ),
  );

/**
 * Serialises the full query-string, merging a cleaned filter into the existing params.
 * Omits the filter key entirely when empty.
 *
 * @param parsed - The currently parsed query-string params.
 * @param filter - The cleaned filter to merge in.
 * @returns The serialised query-string.
 */
const stringifyWithFilter = (
  parsed: qs.ParsedQs,
  filter: Partial<Filter>,
): string =>
  qs.stringify(
    { ...parsed, filter: Object.keys(filter).length ? filter : undefined },
    { arrayFormat: 'indices', skipNulls: true },
  );

export const useFilterParams = (defaults?: Partial<Filter>) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);

  useEffectOnce(() => {
    const parsed = qs.parse(searchParams.toString());
    if (parsed.filter === undefined && defaults) {
      const clean = cleanFilter(defaults);
      if (Object.keys(clean).length) {
        setSearchParams(stringifyWithFilter(parsed, clean), { replace: true });
      }
    }
    setLoading(false);
  });

  const searchParamsStr = searchParams.toString();
  const filter = useMemo(
    () => (qs.parse(searchParamsStr).filter ?? {}) as Filter,
    [searchParamsStr],
  );

  const updateFilter = useCallback(
    (filters: Partial<Filter> | ((prevFilters: Filter) => Partial<Filter>)) => {
      setSearchParams(
        prev => {
          const parsed = qs.parse(prev.toString());
          const prevFilter = (parsed.filter ?? {}) as Filter;
          const partial =
            typeof filters === 'function' ? filters(prevFilter) : filters;
          const next = { ...prevFilter, ...partial };
          const clean = cleanFilter(next);
          return stringifyWithFilter(parsed, clean);
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  return { filter, updateFilter, loading };
};
