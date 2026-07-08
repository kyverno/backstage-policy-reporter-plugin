import { TestApiProvider, renderInTestApp } from '@backstage/test-utils';
import { SelectNamespace } from './SelectNamespace';
import { policyReporterApiRef } from '../../api';
import { PolicyReportsFiltersProvider } from '../../hooks/usePolicyReportsFilters';
import { toastApiRef } from '@backstage/frontend-plugin-api';

const mockGetNamespaces = jest.fn().mockResolvedValue({
  ok: true,
  json: jest.fn().mockResolvedValue(['default', 'kube-system']),
});

const mockPolicyReportApiRef = {
  getNamespaces: mockGetNamespaces,
};

const mockToastApiRef = {
  post: jest.fn(),
};

const renderWithEnv = (defaultFilters: Record<string, unknown> = {}) =>
  renderInTestApp(
    <TestApiProvider
      apis={[
        [policyReporterApiRef, mockPolicyReportApiRef],
        [toastApiRef, mockToastApiRef],
      ]}
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
    expect(mockToastApiRef.post).not.toHaveBeenCalled();
  });

  it('should render multiple selected namespaces from provider defaults', async () => {
    const extension = await renderWithEnv({
      namespaces: ['default', 'kube-system'],
    });
    expect(extension.getAllByText('default')).toBeTruthy();
    expect(extension.getAllByText('kube-system')).toBeTruthy();
    expect(extension.getByText('Namespace')).toBeTruthy();
    expect(mockToastApiRef.post).not.toHaveBeenCalled();
  });

  it('should render all when no defaults are set', async () => {
    const extension = await renderWithEnv();
    expect(extension.getByText('All')).toBeTruthy();
    expect(extension.getByText('Namespace')).toBeTruthy();
    expect(mockToastApiRef.post).not.toHaveBeenCalled();
  });

  it('should call toast api with error from response body when api returns bad response', async () => {
    mockGetNamespaces.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: jest.fn().mockResolvedValue({ error: 'Something went wrong' }),
    });

    await renderWithEnv();

    expect(mockToastApiRef.post).toHaveBeenCalledWith({
      title: 'Failed to fetch namespaces',
      description: 'Something went wrong',
      status: 'danger',
    });
  });

  it('should call toast api with statusText when api returns bad response without error body', async () => {
    mockGetNamespaces.mockResolvedValueOnce({
      ok: false,
      status: 503,
      statusText: 'Service Unavailable',
      json: jest.fn().mockResolvedValue({}),
    });

    await renderWithEnv();

    expect(mockToastApiRef.post).toHaveBeenCalledWith({
      title: 'Failed to fetch namespaces',
      description: 'Service Unavailable',
      status: 'danger',
    });
  });

  it('should call toast api with fallback status message when api returns bad response without error body or statusText', async () => {
    mockGetNamespaces.mockResolvedValueOnce({
      ok: false,
      status: 418,
      statusText: '',
      json: jest.fn().mockResolvedValue({}),
    });

    await renderWithEnv();

    expect(mockToastApiRef.post).toHaveBeenCalledWith({
      title: 'Failed to fetch namespaces',
      description: 'Request failed with status 418',
      status: 'danger',
    });
  });
});
