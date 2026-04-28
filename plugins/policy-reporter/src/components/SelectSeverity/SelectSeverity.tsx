import { Select, Skeleton } from '@backstage/ui';
import { Severity } from '@kyverno/backstage-plugin-policy-reporter-common';
import { Key } from 'react';
import { useFilterParams } from '../../hooks/useFilterParams';

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
  initialSeverity?: Severity[];
};

export const SelectSeverity = ({ initialSeverity }: SelectSeverityProps) => {
  const { updateFilter, filter, loading } = useFilterParams({
    severities: initialSeverity,
  });

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

    // Input is an array - filter and validate
    const filteredStatuses = key.filter((item): item is Severity =>
      validSeverities.includes(item as Severity),
    );

    updateFilter({ severities: filteredStatuses });
  };

  if (loading) return <Skeleton width={200} height={24} />;

  return (
    <Select
      label="Severity"
      selectionMode="multiple"
      options={SEVERITY_OPTIONS}
      defaultValue={filter.severities}
      onChange={handleChange}
      placeholder="All"
      style={{ width: 200 }}
    />
  );
};
