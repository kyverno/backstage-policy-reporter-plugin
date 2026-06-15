import { Select } from '@backstage/ui';
import { Key, useEffect, useRef } from 'react';
import { usePolicyReportsFilters } from '../../hooks/usePolicyReportsFilters';
import { useNamespaces } from '../../hooks/useNamespaces';

export const SelectNamespace = () => {
  const { filter, updateFilter, environment } = usePolicyReportsFilters();
  const { namespaces } = useNamespaces(environment);

  const options = namespaces.map(ns => ({ value: ns, label: ns }));

  const selectedNamespaces = filter.namespaces ?? [];

  // Keep a ref so the effect can read the latest selection without making it
  // a dependency — the effect should only trigger when available namespaces change.
  const selectedNamespacesRef = useRef(selectedNamespaces);
  selectedNamespacesRef.current = selectedNamespaces;

  useEffect(() => {
    const validNamespaces = new Set(namespaces);
    const selected = selectedNamespacesRef.current;

    if (selected.every(ns => validNamespaces.has(ns))) return;

    updateFilter({
      namespaces: selected.filter(ns => validNamespaces.has(ns)),
    });
  }, [namespaces, updateFilter]);

  const handleChange = (key: Key | Key[] | null) => {
    if (key === null) {
      updateFilter({ namespaces: [] });
      return;
    }

    if (!Array.isArray(key)) {
      updateFilter({
        namespaces: namespaces.includes(key as string) ? [key as string] : [],
      });
      return;
    }

    const filtered = key.filter((item): item is string =>
      namespaces.includes(item as string),
    );
    updateFilter({ namespaces: filtered });
  };

  return (
    <Select
      label="Namespace"
      selectionMode="multiple"
      options={options}
      value={selectedNamespaces}
      onChange={handleChange}
      placeholder="All"
    />
  );
};
