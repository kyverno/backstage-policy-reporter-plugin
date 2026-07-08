import { TestApiProvider, renderInTestApp } from '@backstage/test-utils';
import { SelectKind } from './SelectKind';
import { policyReporterApiRef } from '../../api';
import { PolicyReportsFiltersProvider } from '../../hooks/usePolicyReportsFilters';
import { toastApiRef } from '@backstage/frontend-plugin-api';

const mockGetKinds = jest.fn().mockResolvedValue({
  ok: true,
  json: jest.fn().mockResolvedValue(['Deployment', 'Pod']),
});

const mockPolicyReportApiRef = {
  getKinds: mockGetKinds,
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
