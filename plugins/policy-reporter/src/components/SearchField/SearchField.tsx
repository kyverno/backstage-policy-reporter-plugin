import { useEffect, useState } from 'react';
import { useDebounce } from 'react-use';
import { SearchField as BackstageSearchField } from '@backstage/ui';
import { usePolicyReportsFilters } from '../../hooks/usePolicyReportsFilters';

export const SearchField = () => {
  const { filter, updateFilter } = usePolicyReportsFilters();
  const [inputValue, setInputValue] = useState(filter.search ?? '');

  // Sync input value when filter.search changes externally (back/forward nav).
  useEffect(() => {
    setInputValue(filter.search ?? '');
  }, [filter.search]);

  useDebounce(
    () => {
      updateFilter({ search: inputValue || undefined });
    },
    300,
    [inputValue],
  );

  return (
    <BackstageSearchField
      aria-label="Search"
      label="Search"
      value={inputValue}
      onChange={setInputValue}
      style={{ width: '350px' }}
    />
  );
};
