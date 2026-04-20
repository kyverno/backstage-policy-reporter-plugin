import { Select } from '@backstage/ui';
import { Severity } from '@kyverno/backstage-plugin-policy-reporter-common';
import { Key } from 'react';

const SEVERITY_OPTIONS: { value: Severity; label: string }[] = [
  { value: 'unknown', label: 'Unknown' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
  { value: 'info', label: 'Info' },
];

const validSeverities = SEVERITY_OPTIONS.map(option => option.value);

export type SelectSeverityProps = {
  initialSeverity?: Severity[] | Severity;
  setSeverity: (Status: Severity[]) => void;
};

export const SelectSeverity = ({
  initialSeverity,
  setSeverity,
}: SelectSeverityProps) => {
  const handleChange = (key: Key | Key[] | null) => {
    if (key === null) {
      setSeverity([]);
      return;
    }

    if (!Array.isArray(key)) {
      setSeverity(
        validSeverities.includes(key as Severity) ? [key as Severity] : [],
      );
      return;
    }

    // Input is an array - filter and validate
    const filteredStatuses = key.filter((item): item is Severity =>
      validSeverities.includes(item as Severity),
    );
    setSeverity(filteredStatuses);
  };

  return (
    <Select
      label="Severity"
      selectionMode="multiple"
      options={SEVERITY_OPTIONS}
      defaultValue={initialSeverity}
      onChange={handleChange}
      placeholder="All"
      style={{ width: 200 }}
    />
  );
};
