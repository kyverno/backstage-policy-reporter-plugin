import { TestApiProvider, renderInTestApp } from '@backstage/test-utils';
import { SelectSource } from './SelectSource';
import { policyReporterApiRef } from '../../api';
import { PolicyReportsFiltersProvider } from '../../hooks/usePolicyReportsFilters';
import { toastApiRef } from '@backstage/frontend-plugin-api';

const mockGetSources = jest.fn().mockResolvedValue({
  ok: true,
  json: jest.fn().mockResolvedValue(['kyverno', 'trivy']),
});

const mockPolicyReportApiRef = {
  getSources: mockGetSources,
};

const mockToastApiRef = {
  post: jest.fn(),
};

const renderWithEnv = (defaultFilters: Record<string, unknown> = {}) =>
  renderInTestApp(
    <TestApiProvider
      apis={[
        [policyReporterApiRef, mockPolicyReportApiRef as any],
        [toastApiRef, mockToastApiRef],
      ]}
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
