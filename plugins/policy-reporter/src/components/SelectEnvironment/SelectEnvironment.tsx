import { Select } from '@backstage/ui';
import { Environment } from '@kyverno/backstage-plugin-policy-reporter-common';
import { Key } from 'react';
import { usePolicyReportsFilters } from '../../hooks/usePolicyReportsFilters';

type SelectEnvironmentProps = {
  environments: Environment[];
};

export const SelectEnvironment = ({ environments }: SelectEnvironmentProps) => {
  const { environment, setEnvironment } = usePolicyReportsFilters();

  const options = environments.map(env => ({
    value: env.entityRef,
    label: env.name,
  }));

  const handleChange = (key: Key | Key[] | null) => {
    if (key === null || Array.isArray(key)) return;
    setEnvironment(key as string);
  };

  return (
    <Select
      label="Environment"
      selectionMode="single"
      options={options}
      value={environment}
      onChange={handleChange}
    />
  );
};
