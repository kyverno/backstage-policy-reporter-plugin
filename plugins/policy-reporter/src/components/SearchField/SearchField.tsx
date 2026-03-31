import { useSearchParams } from 'react-router-dom';
import { SearchField as BackstageSearchField } from '@backstage/ui';

export const SearchField = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchValue = searchParams.get('search') ?? '';

  const handleChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set('search', value);
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams, { replace: true });
  };

  return (
    <BackstageSearchField
      aria-label="Search"
      label="Search"
      value={searchValue}
      onChange={handleChange}
      style={{ width: '350px' }}
    />
  );
};
