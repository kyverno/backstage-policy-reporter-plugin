import { TestApiProvider, renderInTestApp } from '@backstage/test-utils';
import { SelectPolicy } from './SelectPolicy';
import { policyReporterApiRef } from '../../api';
import { PolicyReportsFiltersProvider } from '../../hooks/usePolicyReportsFilters';
import { toastApiRef } from '@backstage/frontend-plugin-api';

const mockGetPolicies = jest.fn().mockResolvedValue({
  ok: true,
  json: jest
    .fn()
    .mockResolvedValue(['require-non-root-groups', 'require-request-limits']),
});

const mockPolicyReportApiRef = {
  getPolicies: mockGetPolicies,
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
    expect(mockToastApiRef.post).not.toHaveBeenCalled();
  });

  it('should render multiple selected policies from provider defaults', async () => {
    const extension = await renderWithEnv({
      policies: ['require-non-root-groups', 'require-request-limits'],
    });
    expect(extension.getAllByText('require-non-root-groups')).toBeTruthy();
    expect(extension.getAllByText('require-request-limits')).toBeTruthy();
    expect(extension.getByText('Policy')).toBeTruthy();
    expect(mockToastApiRef.post).not.toHaveBeenCalled();
  });

  it('should render all when no defaults are set', async () => {
    const extension = await renderWithEnv();
    expect(extension.getByText('All')).toBeTruthy();
    expect(extension.getByText('Policy')).toBeTruthy();
    expect(mockToastApiRef.post).not.toHaveBeenCalled();
  });

  it('should call toast api with error from response body when api returns bad response', async () => {
    mockGetPolicies.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: jest.fn().mockResolvedValue({ error: 'Something went wrong' }),
    });

    await renderWithEnv();

    expect(mockToastApiRef.post).toHaveBeenCalledWith({
      title: 'Failed to fetch policies',
      description: 'Something went wrong',
      status: 'danger',
    });
  });

  it('should call toast api with statusText when api returns bad response without error body', async () => {
    mockGetPolicies.mockResolvedValueOnce({
      ok: false,
      status: 503,
      statusText: 'Service Unavailable',
      json: jest.fn().mockResolvedValue({}),
    });

    await renderWithEnv();

    expect(mockToastApiRef.post).toHaveBeenCalledWith({
      title: 'Failed to fetch policies',
      description: 'Service Unavailable',
      status: 'danger',
    });
  });

  it('should call toast api with fallback status message when api returns bad response without error body or statusText', async () => {
    mockGetPolicies.mockResolvedValueOnce({
      ok: false,
      status: 418,
      statusText: '',
      json: jest.fn().mockResolvedValue({}),
    });

    await renderWithEnv();

    expect(mockToastApiRef.post).toHaveBeenCalledWith({
      title: 'Failed to fetch policies',
      description: 'Request failed with status 418',
      status: 'danger',
    });
  });
});
