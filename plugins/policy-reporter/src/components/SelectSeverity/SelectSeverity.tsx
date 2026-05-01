import { Select } from '@backstage/ui';
import { Severity } from '@kyverno/backstage-plugin-policy-reporter-common';
import { Key } from 'react';
import { usePolicyReportsFilters } from '../../hooks/usePolicyReportsFilters';

const SEVERITY_OPTIONS: { value: Severity; label: string }[] = [
  { value: 'unknown', label: 'Unknown' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
  { value: 'info', label: 'Info' },
];

const validSeverities = SEVERITY_OPTIONS.map(option => option.value);

export const SelectSeverity = () => {
  const { filter, updateFilter } = usePolicyReportsFilters();

  const handleChange = (key: Key | Key[] | null) => {
    if (key === null) {
      updateFilter({ severities: [] });
      return;
    }

    if (!Array.isArray(key)) {
      updateFilter({
        severities: validSeverities.includes(key as Severity)
          ? [key as Severity]
          : [],
      });
      return;
    }

    const filteredSeverities = key.filter((item): item is Severity =>
      validSeverities.includes(item as Severity),
    );
    updateFilter({ severities: filteredSeverities });
  };

  return (
    <Select
      label="Severity"
      selectionMode="multiple"
      options={SEVERITY_OPTIONS}
      value={filter.severities ?? []}
      onChange={handleChange}
      placeholder="All"
      style={{ width: 200 }}
    />
  );
};
