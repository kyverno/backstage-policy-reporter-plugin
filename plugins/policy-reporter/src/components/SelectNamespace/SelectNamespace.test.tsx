import { TestApiProvider, renderInTestApp } from '@backstage/test-utils';
import { SelectNamespace } from './SelectNamespace';
import { policyReporterApiRef } from '../../api';
import { PolicyReportsFiltersProvider } from '../../hooks/usePolicyReportsFilters';

const mockGetNamespaces = jest.fn().mockResolvedValue({
  ok: true,
  json: jest.fn().mockResolvedValue(['default', 'kube-system']),
});

const mockPolicyReportApiRef = {
  getNamespaces: mockGetNamespaces,
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
        <SelectNamespace />
      </PolicyReportsFiltersProvider>
    </TestApiProvider>,
  );

describe('SelectNamespace', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the selected namespace from provider defaults', async () => {
    const extension = await renderWithEnv({ namespaces: ['default'] });
    expect(extension.getAllByText('default')).toBeTruthy();
    expect(extension.getByText('Namespace')).toBeTruthy();
  });

  it('should render multiple selected namespaces from provider defaults', async () => {
    const extension = await renderWithEnv({
      namespaces: ['default', 'kube-system'],
    });
    expect(extension.getAllByText('default')).toBeTruthy();
    expect(extension.getAllByText('kube-system')).toBeTruthy();
    expect(extension.getByText('Namespace')).toBeTruthy();
  });

  it('should render all when no defaults are set', async () => {
    const extension = await renderWithEnv();
    expect(extension.getByText('All')).toBeTruthy();
    expect(extension.getByText('Namespace')).toBeTruthy();
  });
});
