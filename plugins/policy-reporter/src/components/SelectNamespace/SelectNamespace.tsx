import { Select, Skeleton } from '@backstage/ui';
import { Key } from 'react';
import { useFilterParams } from '../../hooks/useFilterParams';

export type SelectNamespaceProps = {
  initialNamespaces?: string[];
  availableNamespaces: string[];
};

export const SelectNamespace = ({
  initialNamespaces,
  availableNamespaces,
}: SelectNamespaceProps) => {
  const { updateFilter, filter, loading } = useFilterParams({
    namespaces: initialNamespaces,
  });

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

  if (loading) return <Skeleton width={200} height={24} />;

  return (
    <Select
      label="Namespace"
      selectionMode="multiple"
      options={options}
      defaultValue={filter.namespaces}
      onChange={handleChange}
      placeholder="All"
      style={{ width: 200 }}
    />
  );
};
