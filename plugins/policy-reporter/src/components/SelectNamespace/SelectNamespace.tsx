import { Select } from '@backstage/ui';
import { Key } from 'react';

export type SelectNamespaceProps = {
  initialNamespaces?: string[];
  setNamespaces: (namespaces: string[]) => void;
  availableNamespaces: string[];
};

export const SelectNamespace = ({
  initialNamespaces,
  setNamespaces,
  availableNamespaces,
}: SelectNamespaceProps) => {
  const options = availableNamespaces.map(ns => ({ value: ns, label: ns }));

  const handleChange = (key: Key | Key[] | null) => {
    if (key === null) {
      setNamespaces([]);
      return;
    }

    if (!Array.isArray(key)) {
      setNamespaces(
        availableNamespaces.includes(key as string) ? [key as string] : [],
      );
      return;
    }

    const filtered = key.filter((item): item is string =>
      availableNamespaces.includes(item as string),
    );
    setNamespaces(filtered);
  };

  return (
    <Select
      label="Namespace"
      selectionMode="multiple"
      options={options}
      defaultValue={initialNamespaces}
      onChange={handleChange}
      placeholder="All"
      style={{ width: 200 }}
    />
  );
};
