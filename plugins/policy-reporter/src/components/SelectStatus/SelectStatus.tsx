import { Status } from '@kyverno/backstage-plugin-policy-reporter-common';
import { Select } from '@backstage/ui';
import { Key } from 'react';

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
  initialStatus?: Status[] | Status;
  setStatus: (Status: Status[]) => void;
};

export const SelectStatus = ({
  initialStatus,
  setStatus,
}: SelectStatusProps) => {
  const handleChange = (key: Key | Key[] | null) => {
    if (key === null) {
      setStatus([]);
      return;
    }

    if (!Array.isArray(key)) {
      setStatus(validStatuses.includes(key as Status) ? [key as Status] : []);
      return;
    }

    // Input is an array - filter and validate
    const filteredStatuses = key.filter((item): item is Status =>
      validStatuses.includes(item as Status),
    );
    setStatus(filteredStatuses);
  };

  return (
    <Select
      label="Status"
      selectionMode="multiple"
      options={STATUS_OPTIONS}
      defaultValue={initialStatus}
      onChange={handleChange}
      placeholder="All"
      style={{ width: 200 }}
    />
  );
};
