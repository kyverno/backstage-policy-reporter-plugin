import { renderInTestApp } from '@backstage/test-utils';
import { SelectSeverity } from './SelectSeverity';
import { PolicyReportsFiltersProvider } from '../../hooks/usePolicyReportsFilters';

describe('SelectSeverity', () => {
  it('should render the selected severity from provider defaults', async () => {
    const extension = await renderInTestApp(
      <PolicyReportsFiltersProvider defaults={{ severities: ['critical'] }}>
        <SelectSeverity />
      </PolicyReportsFiltersProvider>,
    );
    expect(extension.getAllByText('Critical')).toBeTruthy();
    expect(extension.getByText('Severity')).toBeTruthy();
  });

  it('should render multiple selected severities from provider defaults', async () => {
    const extension = await renderInTestApp(
      <PolicyReportsFiltersProvider defaults={{ severities: ['info', 'low'] }}>
        <SelectSeverity />
      </PolicyReportsFiltersProvider>,
    );
    expect(extension.getAllByText('Info')).toBeTruthy();
    expect(extension.getAllByText('Low')).toBeTruthy();
    expect(extension.getByText('Severity')).toBeTruthy();
  });

  it('should render all when no defaults are set', async () => {
    const extension = await renderInTestApp(
      <PolicyReportsFiltersProvider>
        <SelectSeverity />
      </PolicyReportsFiltersProvider>,
    );
    expect(extension.getByText('All')).toBeTruthy();
    expect(extension.getByText('Severity')).toBeTruthy();
  });
});
