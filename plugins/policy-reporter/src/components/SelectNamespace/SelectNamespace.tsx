import { Select, Skeleton } from '@backstage/ui';
import { Key } from 'react';
import { useFilterParams } from '../../hooks/useFilterParams';
import { useEnvironmentParam } from '../../hooks/useEnvironmentParam';
import { useNamespaces } from '../../hooks/useNamespaces';

export type SelectNamespaceProps = {
  initialNamespaces?: string[];
};

export const SelectNamespace = ({
  initialNamespaces,
}: SelectNamespaceProps) => {
  const {
    updateFilter,
    filter,
    loading: filterLoading,
  } = useFilterParams({
    namespaces: initialNamespaces,
  });
  const { environment } = useEnvironmentParam();
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

  if (filterLoading) return <Skeleton width={200} height={24} />;

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
