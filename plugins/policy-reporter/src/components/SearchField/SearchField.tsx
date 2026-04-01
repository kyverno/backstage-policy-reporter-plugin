import { useState } from 'react';
import { useDebounce } from 'react-use';
import { SearchField as BackstageSearchField } from '@backstage/ui';
import { useFilterParams } from '../../hooks/useFilterParams';

export const SearchField = () => {
  const { filter, setFilter } = useFilterParams();
  const [inputValue, setInputValue] = useState(filter.search ?? '');

  useDebounce(
    () => {
      setFilter(prev => ({
        ...prev,
        search: inputValue || undefined,
      }));
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
