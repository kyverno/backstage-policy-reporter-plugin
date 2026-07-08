import { IdentifiedOption, Select, useAsyncList } from '@backstage/ui';
import { Key, useEffect, useMemo, useRef } from 'react';
import { usePolicyReportsFilters } from '../../hooks/usePolicyReportsFilters';
import { toastApiRef, useApi } from '@backstage/frontend-plugin-api';
import { policyReporterApiRef } from '../../api';
import { RequestError } from '@kyverno/backstage-plugin-policy-reporter-common';

export const SelectNamespace = () => {
  const { filter, updateFilter, environment } = usePolicyReportsFilters();
  const api = useApi(policyReporterApiRef);
  const toast = useApi(toastApiRef);

  const namespaceOptions = useAsyncList<IdentifiedOption>({
    async load({}) {
      if (!environment) return { items: [] };
      const response = await api.getNamespaces({ query: { environment } });
      const result = await response.json();

      if (!response.ok) {
        toast.post({
          title: 'Failed to fetch namespaces',
          description:
            (result as unknown as RequestError).error ||
            response.statusText ||
            `Request failed with status ${response.status}`,
          status: 'danger',
        });
        return { items: [] };
      }

      const namespaces = Array.isArray(result) ? result : [];

      return {
        items: namespaces.map(ns => ({ id: ns, label: ns })),
      };
    },
  });

  const namespaces = useMemo(() => {
    if (namespaceOptions.isLoading || namespaceOptions.items.length === 0) {
      return undefined;
    }

    return new Set(namespaceOptions.items.map(ns => ns.label));
  }, [namespaceOptions.isLoading, namespaceOptions.items]);

  // useRef to avoid dependency on the useAsyncList result
  const namespacesRef = useRef(namespaceOptions);
  namespacesRef.current = namespaceOptions;

  // Fetch namespaces again after changes to the environment
  useEffect(() => {
    namespacesRef.current.reload();
  }, [environment]);

  const selectedNamespaces = filter.namespaces ?? [];

  // Keep a ref so the effect can read the latest selection without making it
  // a dependency — the effect should only trigger when available namespaces change.
  const selectedNamespacesRef = useRef(selectedNamespaces);
  selectedNamespacesRef.current = selectedNamespaces;

  useEffect(() => {
    if (!namespaces) return;

    const selected = selectedNamespacesRef.current;

    if (selected.every(ns => namespaces.has(ns))) return;

    updateFilter({
      namespaces: selected.filter(ns => namespaces.has(ns)),
    });
  }, [namespaces, updateFilter]);

  const handleChange = (key: Key | Key[] | null) => {
    if (key === null) {
      updateFilter({ namespaces: [] });
      return;
    }

    if (!namespaces) return;

    if (!Array.isArray(key)) {
      updateFilter({
        namespaces: namespaces.has(key as string) ? [key as string] : [],
      });
      return;
    }

    const filtered = key.filter((item): item is string =>
      namespaces.has(item as string),
    );
    updateFilter({ namespaces: filtered });
  };

  return (
    <Select
      label="Namespace"
      selectionMode="multiple"
      options={namespaceOptions}
      value={selectedNamespaces}
      onChange={handleChange}
      placeholder="All"
    />
  );
};
