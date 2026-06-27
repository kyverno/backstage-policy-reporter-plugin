import { TestApiProvider, renderInTestApp } from '@backstage/test-utils';
import { SelectPolicy } from './SelectPolicy';
import { policyReporterApiRef } from '../../api';
import { PolicyReportsFiltersProvider } from '../../hooks/usePolicyReportsFilters';

const mockGetPolicies = jest.fn().mockResolvedValue({
  json: jest
    .fn()
    .mockResolvedValue(['require-non-root-groups', 'require-request-limits']),
});

const mockPolicyReportApiRef = {
  mockGetPolicies: mockGetPolicies,
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
        <SelectPolicy />
      </PolicyReportsFiltersProvider>
    </TestApiProvider>,
  );

describe('SelectPolicy', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the selected policy from provider defaults', async () => {
    const extension = await renderWithEnv({
      policies: ['require-non-root-groups'],
    });
    expect(extension.getAllByText('require-non-root-groups')).toBeTruthy();
    expect(extension.getByText('Policy')).toBeTruthy();
  });

  it('should render multiple selected policies from provider defaults', async () => {
    const extension = await renderWithEnv({
      policies: ['require-non-root-groups', 'require-request-limits'],
    });
    expect(extension.getAllByText('require-non-root-groups')).toBeTruthy();
    expect(extension.getAllByText('require-request-limits')).toBeTruthy();
    expect(extension.getByText('Policy')).toBeTruthy();
  });

  it('should render all when no defaults are set', async () => {
    const extension = await renderWithEnv();
    expect(extension.getByText('All')).toBeTruthy();
    expect(extension.getByText('Policy')).toBeTruthy();
  });
});
