import { renderInTestApp } from '@backstage/test-utils';
import { SelectStatus } from './SelectStatus';
import { PolicyReportsFiltersProvider } from '../../hooks/usePolicyReportsFilters';

describe('SelectStatus', () => {
  it('should render the selected status from provider defaults', async () => {
    const extension = await renderInTestApp(
      <PolicyReportsFiltersProvider defaults={{ status: ['fail'] }}>
        <SelectStatus />
      </PolicyReportsFiltersProvider>,
    );
    expect(extension.getAllByText('Fail')).toBeTruthy();
    expect(extension.getByText('Status')).toBeTruthy();
  });

  it('should render multiple selected statuses from provider defaults', async () => {
    const extension = await renderInTestApp(
      <PolicyReportsFiltersProvider defaults={{ status: ['fail', 'summary'] }}>
        <SelectStatus />
      </PolicyReportsFiltersProvider>,
    );
    expect(extension.getAllByText('Fail')).toBeTruthy();
    expect(extension.getAllByText('Summary')).toBeTruthy();
    expect(extension.getByText('Status')).toBeTruthy();
  });

  it('should render all when no defaults are set', async () => {
    const extension = await renderInTestApp(
      <PolicyReportsFiltersProvider>
        <SelectStatus />
      </PolicyReportsFiltersProvider>,
    );
    expect(extension.getByText('All')).toBeTruthy();
    expect(extension.getByText('Status')).toBeTruthy();
  });
});
