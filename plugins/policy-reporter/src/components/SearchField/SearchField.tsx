import { useState } from 'react';
import { useDebounce } from 'react-use';
import { SearchField as BackstageSearchField, Skeleton } from '@backstage/ui';
import { useFilterParams } from '../../hooks/useFilterParams';

export const SearchField = () => {
  const { filter, updateFilter, loading } = useFilterParams();
  const [inputValue, setInputValue] = useState(filter.search ?? '');

  useDebounce(
    () => {
      updateFilter({
        search: inputValue || undefined,
      });
    },
    300,
    [inputValue],
  );

  if (loading) return <Skeleton width={350} height={24} />;

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
