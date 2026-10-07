import { TestApiProvider, renderInTestApp } from '@backstage/test-utils';
import { waitFor } from '@testing-library/react';
import { SelectSource } from './SelectSource';
import { policyReporterApiRef } from '../../api';
import { PolicyReportsFiltersProvider } from '../../hooks/usePolicyReportsFilters';
import { toastApiRef } from '@backstage/frontend-plugin-api';

const mockGetSources = jest.fn().mockResolvedValue({
  ok: true,
  json: jest.fn().mockResolvedValue(['kyverno', 'trivy']),
});

const mockGetClusterSources = jest.fn().mockResolvedValue({
  ok: true,
  json: jest.fn().mockResolvedValue(['kyverno', 'trivy']),
});

const mockPolicyReportApiRef = {
  getSources: mockGetSources,
  getClusterSources: mockGetClusterSources,
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
        <SelectSource />
      </PolicyReportsFiltersProvider>
    </TestApiProvider>,
  );

describe('SelectSource', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call the cluster api when context is cluster', async () => {
    await renderWithEnv({}, 'cluster');

    await waitFor(() =>
      expect(mockGetClusterSources).toHaveBeenCalledWith({
        query: { environment: 'resource:default/dev' },
      }),
    );
    expect(mockGetSources).not.toHaveBeenCalled();
  });

  it('should call the namespaced api when context is namespaced', async () => {
    await renderWithEnv({}, 'namespaced');

    await waitFor(() =>
      expect(mockGetSources).toHaveBeenCalledWith({
        query: { environment: 'resource:default/dev' },
      }),
    );
    expect(mockGetClusterSources).not.toHaveBeenCalled();
  });

  it('should toast when the cluster api returns a bad response', async () => {
    mockGetClusterSources.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: jest.fn().mockResolvedValue({ error: 'Something went wrong' }),
    });

    await renderWithEnv({}, 'cluster');

    await waitFor(() =>
      expect(mockToastApiRef.post).toHaveBeenCalledWith({
        title: 'Failed to fetch sources',
        description: 'Something went wrong',
        status: 'danger',
      }),
    );
  });

  it('should render the selected source from provider defaults', async () => {
    const extension = await renderWithEnv({ sources: ['kyverno'] });
    expect(extension.getAllByText('kyverno')).toBeTruthy();
    expect(extension.getByText('Source')).toBeTruthy();
    expect(mockToastApiRef.post).not.toHaveBeenCalled();
  });

  it('should render multiple selected sources from provider defaults', async () => {
    const extension = await renderWithEnv({
      sources: ['kyverno', 'trivy'],
    });
    expect(extension.getAllByText('kyverno')).toBeTruthy();
    expect(extension.getAllByText('trivy')).toBeTruthy();
    expect(extension.getByText('Source')).toBeTruthy();
    expect(mockToastApiRef.post).not.toHaveBeenCalled();
  });

  it('should render all when no defaults are set', async () => {
    const extension = await renderWithEnv();
    expect(extension.getByText('All')).toBeTruthy();
    expect(extension.getByText('Source')).toBeTruthy();
    expect(mockToastApiRef.post).not.toHaveBeenCalled();
  });

  it('should call toast api with error from response body when api returns bad response', async () => {
    mockGetSources.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: jest.fn().mockResolvedValue({ error: 'Something went wrong' }),
    });

    await renderWithEnv();

    expect(mockToastApiRef.post).toHaveBeenCalledWith({
      title: 'Failed to fetch sources',
      description: 'Something went wrong',
      status: 'danger',
    });
  });

  it('should call toast api with statusText when api returns bad response without error body', async () => {
    mockGetSources.mockResolvedValueOnce({
      ok: false,
      status: 503,
      statusText: 'Service Unavailable',
      json: jest.fn().mockResolvedValue({}),
    });

    await renderWithEnv();

    expect(mockToastApiRef.post).toHaveBeenCalledWith({
      title: 'Failed to fetch sources',
      description: 'Service Unavailable',
      status: 'danger',
    });
  });

  it('should call toast api with fallback status message when api returns bad response without error body or statusText', async () => {
    mockGetSources.mockResolvedValueOnce({
      ok: false,
      status: 418,
      statusText: '',
      json: jest.fn().mockResolvedValue({}),
    });

    await renderWithEnv();

    expect(mockToastApiRef.post).toHaveBeenCalledWith({
      title: 'Failed to fetch sources',
      description: 'Request failed with status 418',
      status: 'danger',
    });
  });
});
