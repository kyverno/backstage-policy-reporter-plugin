import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderInTestApp } from '@backstage/test-utils';
import { SearchField } from './SearchField';
import { PolicyReportsFiltersProvider } from '../../hooks/usePolicyReportsFilters';

const renderWithProvider = (defaultFilters = {}) =>
  renderInTestApp(
    <PolicyReportsFiltersProvider
      defaultEnvironment="resource:default/dev"
      defaultFilters={defaultFilters}
    >
      <SearchField />
    </PolicyReportsFiltersProvider>,
  );

describe('SearchField', () => {
  it('should render the search field', async () => {
    await renderWithProvider();

    expect(screen.getByLabelText('Search')).toBeInTheDocument();
  });

  it('should update input value immediately on typing', async () => {
    const user = userEvent.setup();
    await renderWithProvider();

    const input = screen.getByLabelText('Search');
    await user.type(input, 'test');

    expect(input).toHaveValue('test');
  });

  it('should pre-populate value from provider defaults', async () => {
    await renderWithProvider({ search: 'prefilled' });

    expect(screen.getByLabelText('Search')).toHaveValue('prefilled');
  });
});
