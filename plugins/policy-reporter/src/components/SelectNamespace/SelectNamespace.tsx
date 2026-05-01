import { Select } from '@backstage/ui';
import { Key } from 'react';
import { usePolicyReportsFilters } from '../../hooks/usePolicyReportsFilters';
import { useNamespaces } from '../../hooks/useNamespaces';

export const SelectNamespace = () => {
  const { filter, updateFilter, environment } = usePolicyReportsFilters();
  const { namespaces: availableNamespaces } = useNamespaces(environment);

  const options = availableNamespaces.map(ns => ({ value: ns, label: ns }));

  const handleChange = (key: Key | Key[] | null) => {
    if (key === null) {
      updateFilter({ namespaces: [] });
      return;
    }

    if (!Array.isArray(key)) {
      updateFilter({
        namespaces: availableNamespaces.includes(key as string)
          ? [key as string]
          : [],
      });
      return;
    }

    const filtered = key.filter((item): item is string =>
      availableNamespaces.includes(item as string),
    );
    updateFilter({ namespaces: filtered });
  };

  return (
    <Select
      label="Namespace"
      selectionMode="multiple"
      options={options}
      value={filter.namespaces ?? []}
      onChange={handleChange}
      placeholder="All"
      style={{ width: 200 }}
    />
  );
};
