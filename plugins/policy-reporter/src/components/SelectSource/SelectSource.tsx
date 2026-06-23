import { IdentifiedOption, Select, useAsyncList } from '@backstage/ui';
import { Key, useEffect, useMemo, useRef } from 'react';
import { usePolicyReportsFilters } from '../../hooks/usePolicyReportsFilters';
import { policyReporterApiRef } from '../../api';
import { useApi } from '@backstage/frontend-plugin-api';

export const SelectSource = () => {
  const { filter, updateFilter, environment } = usePolicyReportsFilters();
  const api = useApi(policyReporterApiRef);

  const sourceOptions = useAsyncList<IdentifiedOption>({
    async load({}) {
      if (!environment) return { items: [] };
      const response = await api.getSources({ query: { environment } });

      const result = await response.json();

      return {
        items: result.map(s => ({ id: s, label: s })),
      };
    },
  });

  const sources = useMemo(
    () => new Set(sourceOptions.items.map(s => s.label)),
    [sourceOptions.items],
  );

  // useRef to avoid dependency on the useAsyncList result
  const sourceRef = useRef(sourceOptions);
  sourceRef.current = sourceOptions;

  // Fetch sources again after changes to the environment
  useEffect(() => {
    sourceRef.current.reload();
  }, [environment]);

  const selectedSources = filter.sources ?? [];

  // Keep a ref so the effect can read the latest selection without making it
  // a dependency — the effect should only trigger when available sources change.
  const selectedSourcesRef = useRef(selectedSources);
  selectedSourcesRef.current = selectedSources;

  useEffect(() => {
    const selected = selectedSourcesRef.current;

    if (selected.every(source => sources.has(source))) return;

    updateFilter({
      sources: selected.filter(source => sources.has(source)),
    });
  }, [sources, updateFilter]);

  const handleChange = (key: Key | Key[] | null) => {
    if (key === null) {
      updateFilter({ sources: [] });
      return;
    }

    if (!Array.isArray(key)) {
      updateFilter({
        sources: sources.has(key as string) ? [key as string] : [],
      });
      return;
    }

    const filtered = key.filter((item): item is string =>
      sources.has(item as string),
    );
    updateFilter({ sources: filtered });
  };

  return (
    <Select
      label="Source"
      selectionMode="multiple"
      options={sourceOptions}
      value={selectedSources}
      onChange={handleChange}
      placeholder="All"
    />
  );
};
