import { TestApiProvider, renderInTestApp } from '@backstage/test-utils';
import { waitFor } from '@testing-library/react';
import { SelectKind } from './SelectKind';
import { policyReporterApiRef } from '../../api';
import { PolicyReportsFiltersProvider } from '../../hooks/usePolicyReportsFilters';
import { toastApiRef } from '@backstage/frontend-plugin-api';

const mockGetKinds = jest.fn().mockResolvedValue({
  ok: true,
  json: jest.fn().mockResolvedValue(['Deployment', 'Pod']),
});

const mockGetClusterKinds = jest.fn().mockResolvedValue({
  ok: true,
  json: jest.fn().mockResolvedValue(['ClusterRole', 'Namespace']),
});

const mockPolicyReportApiRef = {
  getKinds: mockGetKinds,
  getClusterKinds: mockGetClusterKinds,
};

const mockToastApiRef = {
  post: jest.fn(),
};

const renderWithEnv = (
  defaultFilters: Record<string, unknown> = {},
  context: 'cluster' | 'namespaced' = 'namespaced',
) =>
  renderInTestApp(
    <TestApiProvider
      apis={[
        [policyReporterApiRef, mockPolicyReportApiRef as any],
        [toastApiRef, mockToastApiRef],
      ]}
    >
      <PolicyReportsFiltersProvider
        context={context}
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

  it('should call the cluster api when context is cluster', async () => {
    await renderWithEnv({}, 'cluster');

    await waitFor(() =>
      expect(mockGetClusterKinds).toHaveBeenCalledWith({
        query: { environment: 'resource:default/dev' },
      }),
    );
    expect(mockGetKinds).not.toHaveBeenCalled();
  });

  it('should call the namespaced api when context is namespaced', async () => {
    await renderWithEnv({}, 'namespaced');

    await waitFor(() =>
      expect(mockGetKinds).toHaveBeenCalledWith({
        query: { environment: 'resource:default/dev' },
      }),
    );
    expect(mockGetClusterKinds).not.toHaveBeenCalled();
  });

  it('should toast when the cluster api returns a bad response', async () => {
    mockGetClusterKinds.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: jest.fn().mockResolvedValue({ error: 'Something went wrong' }),
    });

    await renderWithEnv({}, 'cluster');

    await waitFor(() =>
      expect(mockToastApiRef.post).toHaveBeenCalledWith({
        title: 'Failed to fetch kinds',
        description: 'Something went wrong',
        status: 'danger',
      }),
    );
  });

  it('should render the selected kind from provider defaults', async () => {
    const extension = await renderWithEnv({ kinds: ['Deployment'] });
    expect(extension.getAllByText('Deployment')).toBeTruthy();
    expect(extension.getByText('Kind')).toBeTruthy();
    expect(mockToastApiRef.post).not.toHaveBeenCalled();
  });

  it('should render multiple selected kinds from provider defaults', async () => {
    const extension = await renderWithEnv({
      kinds: ['Deployment', 'Pod'],
    });
    expect(extension.getAllByText('Deployment')).toBeTruthy();
    expect(extension.getAllByText('Pod')).toBeTruthy();
    expect(extension.getByText('Kind')).toBeTruthy();
    expect(mockToastApiRef.post).not.toHaveBeenCalled();
  });

  it('should render all when no defaults are set', async () => {
    const extension = await renderWithEnv();
    expect(extension.getByText('All')).toBeTruthy();
    expect(extension.getByText('Kind')).toBeTruthy();
    expect(mockToastApiRef.post).not.toHaveBeenCalled();
  });

  it('should call toast api with error from response body when api returns bad response', async () => {
    mockGetKinds.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: jest.fn().mockResolvedValue({ error: 'Something went wrong' }),
    });

    await renderWithEnv();

    expect(mockToastApiRef.post).toHaveBeenCalledWith({
      title: 'Failed to fetch kinds',
      description: 'Something went wrong',
      status: 'danger',
    });
  });

  it('should call toast api with statusText when api returns bad response without error body', async () => {
    mockGetKinds.mockResolvedValueOnce({
      ok: false,
      status: 503,
      statusText: 'Service Unavailable',
      json: jest.fn().mockResolvedValue({}),
    });

    await renderWithEnv();

    expect(mockToastApiRef.post).toHaveBeenCalledWith({
      title: 'Failed to fetch kinds',
      description: 'Service Unavailable',
      status: 'danger',
    });
  });

  it('should call toast api with fallback status message when api returns bad response without error body or statusText', async () => {
    mockGetKinds.mockResolvedValueOnce({
      ok: false,
      status: 418,
      statusText: '',
      json: jest.fn().mockResolvedValue({}),
    });

    await renderWithEnv();

    expect(mockToastApiRef.post).toHaveBeenCalledWith({
      title: 'Failed to fetch kinds',
      description: 'Request failed with status 418',
      status: 'danger',
    });
  });
});
