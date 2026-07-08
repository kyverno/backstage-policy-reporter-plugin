import { TestApiProvider, renderInTestApp } from '@backstage/test-utils';
import { SelectCategory } from './SelectCategory';
import { policyReporterApiRef } from '../../api';
import { PolicyReportsFiltersProvider } from '../../hooks/usePolicyReportsFilters';
import { toastApiRef } from '@backstage/frontend-plugin-api';

const mockGetCategories = jest.fn().mockResolvedValue({
  ok: true,
  json: jest
    .fn()
    .mockResolvedValue([
      'Pod Security Standards (Default)',
      'Pod Security Standards (Restricted)',
    ]),
});

const mockPolicyReportApiRef = {
  getCategories: mockGetCategories,
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
        <SelectCategory />
      </PolicyReportsFiltersProvider>
    </TestApiProvider>,
  );

describe('SelectCategory', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the selected category provider defaults', async () => {
    const extension = await renderWithEnv({
      categories: ['Pod Security Standards (Default)'],
    });
    expect(
      extension.getAllByText('Pod Security Standards (Default)'),
    ).toBeTruthy();
    expect(extension.getByText('Category')).toBeTruthy();
    expect(mockToastApiRef.post).not.toHaveBeenCalled();
  });

  it('should render multiple selected categories from provider defaults', async () => {
    const extension = await renderWithEnv({
      categories: [
        'Pod Security Standards (Default)',
        'Pod Security Standards (Restricted)',
      ],
    });
    expect(
      extension.getAllByText('Pod Security Standards (Default)'),
    ).toBeTruthy();
    expect(
      extension.getAllByText('Pod Security Standards (Restricted)'),
    ).toBeTruthy();
    expect(extension.getByText('Category')).toBeTruthy();
    expect(mockToastApiRef.post).not.toHaveBeenCalled();
  });

  it('should render all when no defaults are set', async () => {
    const extension = await renderWithEnv();
    expect(extension.getByText('All')).toBeTruthy();
    expect(extension.getByText('Category')).toBeTruthy();
    expect(mockToastApiRef.post).not.toHaveBeenCalled();
  });

  it('should call toast api with error from response body when api returns bad response', async () => {
    mockGetCategories.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: jest.fn().mockResolvedValue({ error: 'Something went wrong' }),
    });

    await renderWithEnv();

    expect(mockToastApiRef.post).toHaveBeenCalledWith({
      title: 'Failed to fetch categories',
      description: 'Something went wrong',
      status: 'danger',
    });
  });

  it('should call toast api with statusText when api returns bad response without error body', async () => {
    mockGetCategories.mockResolvedValueOnce({
      ok: false,
      status: 503,
      statusText: 'Service Unavailable',
      json: jest.fn().mockResolvedValue({}),
    });

    await renderWithEnv();

    expect(mockToastApiRef.post).toHaveBeenCalledWith({
      title: 'Failed to fetch categories',
      description: 'Service Unavailable',
      status: 'danger',
    });
  });

  it('should call toast api with fallback status message when api returns bad response without error body or statusText', async () => {
    mockGetCategories.mockResolvedValueOnce({
      ok: false,
      status: 418,
      statusText: '',
      json: jest.fn().mockResolvedValue({}),
    });

    await renderWithEnv();

    expect(mockToastApiRef.post).toHaveBeenCalledWith({
      title: 'Failed to fetch categories',
      description: 'Request failed with status 418',
      status: 'danger',
    });
  });
});
