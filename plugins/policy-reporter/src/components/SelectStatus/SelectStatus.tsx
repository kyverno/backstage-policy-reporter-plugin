import { Status } from '@kyverno/backstage-plugin-policy-reporter-common';
import { Select, Skeleton } from '@backstage/ui';
import { Key } from 'react';
import { useFilterParams } from '../../hooks/useFilterParams';

const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: 'fail', label: 'Fail' },
  { value: 'skip', label: 'Skip' },
  { value: 'pass', label: 'Pass' },
  { value: 'warn', label: 'Warn' },
  { value: 'error', label: 'Error' },
  { value: 'summary', label: 'Summary' },
];

const validStatuses = STATUS_OPTIONS.map(option => option.value);

export type SelectStatusProps = {
  initialStatus?: Status[];
};

export const SelectStatus = ({ initialStatus }: SelectStatusProps) => {
  const { updateFilter, filter, loading } = useFilterParams({
    status: initialStatus,
  });

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

    // Input is an array - filter and validate
    const filteredStatuses = key.filter((item): item is Status =>
      validStatuses.includes(item as Status),
    );
    updateFilter({ status: filteredStatuses });
  };

  if (loading) return <Skeleton width={200} height={35} />;

  return (
    <Select
      label="Status"
      selectionMode="multiple"
      options={STATUS_OPTIONS}
      defaultValue={filter.status}
      onChange={handleChange}
      placeholder="All"
      style={{ width: 200 }}
    />
  );
};
