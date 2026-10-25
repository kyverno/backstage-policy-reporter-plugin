import { Select } from '@backstage/ui';
import { Environment } from '@kyverno/backstage-plugin-policy-reporter-common';
import { Key } from 'react';
import { usePolicyReportsFilters } from '../../hooks/usePolicyReportsFilters';

type SelectEnvironmentProps = {
  environments: Environment[];
  // Optional controlled mode, used by pages without a PolicyReportsFiltersProvider
  value?: string;
  onChange?: (environment: string) => void;
};

const EnvironmentSelect = ({
  environments,
  value,
  onChange,
}: Required<SelectEnvironmentProps>) => {
  const options = environments.map(env => ({
    value: env.entityRef,
    label: env.name,
  }));

  const handleChange = (key: Key | Key[] | null) => {
    if (key === null || Array.isArray(key)) return;
    onChange(key as string);
  };

  return (
    <Select
      label="Environment"
      selectionMode="single"
      options={options}
      value={value}
      onChange={handleChange}
    />
  );
};

const FiltersSelectEnvironment = ({
  environments,
}: Pick<SelectEnvironmentProps, 'environments'>) => {
  const { environment, setEnvironment } = usePolicyReportsFilters();

  return (
    <EnvironmentSelect
      environments={environments}
      value={environment}
      onChange={setEnvironment}
    />
  );
};

export const SelectEnvironment = ({
  environments,
  value,
  onChange,
}: SelectEnvironmentProps) => {
  if (value !== undefined && onChange) {
    return (
      <EnvironmentSelect
        environments={environments}
        value={value}
        onChange={onChange}
      />
    );
  }

  return <FiltersSelectEnvironment environments={environments} />;
};
