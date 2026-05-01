import { Status } from '@kyverno/backstage-plugin-policy-reporter-common';
import { Select } from '@backstage/ui';
import { Key } from 'react';
import { usePolicyReportsFilters } from '../../hooks/usePolicyReportsFilters';

const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: 'fail', label: 'Fail' },
  { value: 'skip', label: 'Skip' },
  { value: 'pass', label: 'Pass' },
  { value: 'warn', label: 'Warn' },
  { value: 'error', label: 'Error' },
  { value: 'summary', label: 'Summary' },
];

const validStatuses = STATUS_OPTIONS.map(option => option.value);

export const SelectStatus = () => {
  const { filter, updateFilter } = usePolicyReportsFilters();

  const handleChange = (key: Key | Key[] | null) => {
    if (key === null) {
      updateFilter({ status: [] });
      return;
    }

    if (!Array.isArray(key)) {
      updateFilter({
        status: validStatuses.includes(key as Status) ? [key as Status] : [],
      });
      return;
    }

    const filteredStatuses = key.filter((item): item is Status =>
      validStatuses.includes(item as Status),
    );
    updateFilter({ status: filteredStatuses });
  };

  return (
    <Select
      label="Status"
      selectionMode="multiple"
      options={STATUS_OPTIONS}
      value={filter.status ?? []}
      onChange={handleChange}
      placeholder="All"
      style={{ width: 200 }}
    />
  );
};
