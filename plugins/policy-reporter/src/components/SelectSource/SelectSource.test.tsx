import { TestApiProvider, renderInTestApp } from '@backstage/test-utils';
import { SelectSource } from './SelectSource';
import { policyReporterApiRef } from '../../api';
import { PolicyReportsFiltersProvider } from '../../hooks/usePolicyReportsFilters';

const mockGetSources = jest.fn().mockResolvedValue({
  json: jest.fn().mockResolvedValue(['kyverno', 'trivy']),
});

const mockPolicyReportApiRef = {
  getSources: mockGetSources,
};

const renderWithEnv = (defaultFilters: Record<string, unknown> = {}) =>
  renderInTestApp(
    <TestApiProvider
      apis={[[policyReporterApiRef, mockPolicyReportApiRef as any]]}
    >
      <PolicyReportsFiltersProvider
        defaultEnvironment="resource:default/dev"
        defaultFilters={defaultFilters}
      >
        <SelectSource />
      </PolicyReportsFiltersProvider>
    </TestApiProvider>,
  );

describe('SelectSource', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the selected source from provider defaults', async () => {
    const extension = await renderWithEnv({ sources: ['kyverno'] });
    expect(extension.getAllByText('kyverno')).toBeTruthy();
    expect(extension.getByText('Source')).toBeTruthy();
  });

  it('should render multiple selected sources from provider defaults', async () => {
    const extension = await renderWithEnv({
      sources: ['kyverno', 'trivy'],
    });
    expect(extension.getAllByText('kyverno')).toBeTruthy();
    expect(extension.getAllByText('trivy')).toBeTruthy();
    expect(extension.getByText('Source')).toBeTruthy();
  });

  it('should render all when no defaults are set', async () => {
    const extension = await renderWithEnv();
    expect(extension.getByText('All')).toBeTruthy();
    expect(extension.getByText('Source')).toBeTruthy();
  });
});
