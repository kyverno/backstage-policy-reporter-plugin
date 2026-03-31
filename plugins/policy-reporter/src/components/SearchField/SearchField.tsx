import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDebounce } from 'react-use';
import { SearchField as BackstageSearchField } from '@backstage/ui';

export const SearchField = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [inputValue, setInputValue] = useState(
    searchParams.get('search') ?? '',
  );

  useDebounce(
    () => {
      const newParams = new URLSearchParams(searchParams);
      if (inputValue) {
        newParams.set('search', inputValue);
      } else {
        newParams.delete('search');
      }
      setSearchParams(newParams, { replace: true });
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
