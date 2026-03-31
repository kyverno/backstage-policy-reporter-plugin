import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderInTestApp } from '@backstage/test-utils';
import { SearchField } from './SearchField';

describe('SearchField', () => {
  it('should render the search field', async () => {
    await renderInTestApp(<SearchField />);

    expect(screen.getByLabelText('Search')).toBeInTheDocument();
  });

  it('should update input value immediately on typing', async () => {
    const user = userEvent.setup();
    await renderInTestApp(<SearchField />);

    const input = screen.getByLabelText('Search');
    await user.type(input, 'test');

    expect(input).toHaveValue('test');
  });
});
