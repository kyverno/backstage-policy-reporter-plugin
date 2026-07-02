import { TestApiProvider, renderInTestApp } from '@backstage/test-utils';
import { SelectKind } from './SelectKind';
import { policyReporterApiRef } from '../../api';
import { PolicyReportsFiltersProvider } from '../../hooks/usePolicyReportsFilters';

const mockGetKinds = jest.fn().mockResolvedValue({
  ok: true,
  json: jest.fn().mockResolvedValue(['Deployment', 'Pod']),
});

const mockPolicyReportApiRef = {
  getKinds: mockGetKinds,
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
        <SelectKind />
      </PolicyReportsFiltersProvider>
    </TestApiProvider>,
  );

describe('SelectKind', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the selected kind from provider defaults', async () => {
    const extension = await renderWithEnv({ kinds: ['Deployment'] });
    expect(extension.getAllByText('Deployment')).toBeTruthy();
    expect(extension.getByText('Kind')).toBeTruthy();
  });

  it('should render multiple selected kinds from provider defaults', async () => {
    const extension = await renderWithEnv({
      kinds: ['Deployment', 'Pod'],
    });
    expect(extension.getAllByText('Deployment')).toBeTruthy();
    expect(extension.getAllByText('Pod')).toBeTruthy();
    expect(extension.getByText('Kind')).toBeTruthy();
  });

  it('should render all when no defaults are set', async () => {
    const extension = await renderWithEnv();
    expect(extension.getByText('All')).toBeTruthy();
    expect(extension.getByText('Kind')).toBeTruthy();
  });
});
