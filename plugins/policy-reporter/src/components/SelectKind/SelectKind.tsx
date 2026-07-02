import { IdentifiedOption, Select, useAsyncList } from '@backstage/ui';
import { Key, useEffect, useMemo, useRef } from 'react';
import { usePolicyReportsFilters } from '../../hooks/usePolicyReportsFilters';
import { policyReporterApiRef } from '../../api';
import { toastApiRef, useApi } from '@backstage/frontend-plugin-api';
import { RequestError } from '@kyverno/backstage-plugin-policy-reporter-common';

export const SelectKind = () => {
  const { filter, updateFilter, environment } = usePolicyReportsFilters();
  const api = useApi(policyReporterApiRef);
  const toast = useApi(toastApiRef);

  const kindOptions = useAsyncList<IdentifiedOption>({
    async load({}) {
      if (!environment) return { items: [] };
      const response = await api.getKinds({ query: { environment } });
      const result = await response.json();

      if (!response.ok) {
        toast.post({
          title: 'Failed to fetch kinds',
          description:
            (result as unknown as RequestError).error ??
            response.statusText ??
            `Request failed with status ${response.status}`,
          status: 'danger',
        });
        return { items: [] };
      }

      return {
        items: result.map((k: string) => ({ id: k, label: k })),
      };
    },
  });

  const kinds = useMemo(() => {
    if (kindOptions.isLoading || kindOptions.items.length === 0) {
      return undefined;
    }

    return new Set(kindOptions.items.map(k => k.label));
  }, [kindOptions.isLoading, kindOptions.items]);

  const kindRef = useRef(kindOptions);
  kindRef.current = kindOptions;

  useEffect(() => {
    kindRef.current.reload();
  }, [environment]);

  const selectedKinds = filter.kinds ?? [];

  const selectedKindsRef = useRef(selectedKinds);
  selectedKindsRef.current = selectedKinds;

  useEffect(() => {
    if (!kinds) return;

    const selected = selectedKindsRef.current;

    if (selected.every(kind => kinds.has(kind))) return;

    updateFilter({
      kinds: selected.filter(kind => kinds.has(kind)),
    });
  }, [kinds, updateFilter]);

  const handleChange = (key: Key | Key[] | null) => {
    if (key === null) {
      updateFilter({ kinds: [] });
      return;
    }

    if (!kinds) return;

    if (!Array.isArray(key)) {
      updateFilter({
        kinds: kinds.has(key as string) ? [key as string] : [],
      });
      return;
    }

    const filtered = key.filter((item): item is string =>
      kinds.has(item as string),
    );
    updateFilter({ kinds: filtered });
  };

  return (
    <Select
      label="Kind"
      selectionMode="multiple"
      options={kindOptions}
      value={selectedKinds}
      onChange={handleChange}
      placeholder="All"
    />
  );
};
