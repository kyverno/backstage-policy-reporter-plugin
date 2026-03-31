import { Select } from '@backstage/ui';
import { Environment } from '@kyverno/backstage-plugin-policy-reporter-common';
import { Key } from 'react';

type SelectEnvironmentProps = {
  environments: Environment[];
  initialEnvironment: Environment;
  setCurrentEnvironment: (environment: Environment) => void;
};

export const SelectEnvironment = ({
  environments,
  initialEnvironment,
  setCurrentEnvironment,
}: SelectEnvironmentProps) => {
  const options = environments.map(env => ({
    value: env.entityRef,
    label: env.name,
  }));

  const handleChange = (key: Key | Key[] | null) => {
    if (key === null || Array.isArray(key)) return;

    const env = environments.find(e => e.entityRef === key);
    if (env) setCurrentEnvironment(env);
  };

  return (
    <Select
      label="Environment"
      selectionMode="single"
      options={options}
      defaultValue={initialEnvironment.entityRef}
      onChange={handleChange}
    />
  );
};
