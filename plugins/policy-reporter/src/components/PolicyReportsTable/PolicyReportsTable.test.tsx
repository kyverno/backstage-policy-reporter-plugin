import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';
import { TestApiProvider, renderInTestApp } from '@backstage/test-utils';
import { PolicyReportsTable } from './PolicyReportsTable';
import { policyReporterApiRef } from '../../api';
import { PolicyReportsFiltersProvider } from '../../hooks/usePolicyReportsFilters';
import { toastApiRef } from '@backstage/frontend-plugin-api';

const mockGetNamespacedResults = jest.fn().mockResolvedValue({
  ok: true,
  json: jest.fn().mockResolvedValue({
    items: [],
    count: 0,
    page: 1,
    offset: 5,
    total: 0,
  }),
});

const mockPolicyReportApiRef = {
  getNamespacedResults: mockGetNamespacedResults,
};

const mockToastApiRef = {
  post: jest.fn(),
};

const renderTable = (
  props: Partial<Parameters<typeof PolicyReportsTable>[0]> = {},
) =>
  renderInTestApp(
    <TestApiProvider
      apis={[
        [policyReporterApiRef, mockPolicyReportApiRef as any],
        [toastApiRef, mockToastApiRef],
      ]}
    >
      <PolicyReportsFiltersProvider
        defaultFilters={{}}
        defaultEnvironment="resource:default/dev"
      >
        <PolicyReportsTable emptyContentText="empty" {...props} />
      </PolicyReportsFiltersProvider>
    </TestApiProvider>,
    { routeEntries: ['/?environment=resource:default/dev'] },
  );

describe('KyvernoPolicyReportsTable', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render table displaying the fetched data', async () => {
    // Arrange
    mockGetNamespacedResults.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({
        items: [
          {
            id: '0',
            kind: 'deployment',
            namespace: 'default',
            name: 'name',
            resourceId: 'id',
            message: 'Policy 1 passed successfully',
            timestamp: 123456789,
            policy: 'Policy1',
            rule: 'Rule1',
            status: 'pass',
            severity: 'low',
            properties: {},
          },
        ],
        count: 1,
      }),
    });

    // Act
    const extension = await renderTable();

    expect(extension.getAllByText('Policy1')).toHaveLength(1);
    expect(extension.getAllByText('Rule1')).toHaveLength(1);
  });
  it('should render table displaying the emptyContentText when there are no policies', async () => {
    // Arrange
    mockGetNamespacedResults.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({
        items: [],
        count: 0,
      }),
    });

    // Act
    const extension = await renderTable({
      emptyContentText: 'there are no policies',
    });

    expect(extension.getAllByText('there are no policies')).toHaveLength(1);
  });

  it('should render ResponseErrorPanel when fetching data fails', async () => {
    // Arrange
    // Change the mock implementation of the getPolicies method to throw an error
    mockGetNamespacedResults.mockRejectedValueOnce(
      new Error('Failed to fetch policies'),
    );

    // Act
    const extension = await renderTable({
      emptyContentText: 'there are no policies',
    });

    expect(extension.getByText('Error: Failed to fetch policies')).toBeTruthy();
  });

  it('should render Drawer when clicking on a policy', async () => {
    // Arrange
    mockGetNamespacedResults.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({
        items: [
          {
            id: '0',
            kind: 'deployment',
            namespace: 'default',
            name: 'name',
            resourceId: 'id',
            message: 'Policy 1 passed successfully',
            timestamp: 123456789,
            policy: 'Policy1',
            rule: 'Rule1',
            status: 'pass',
            severity: 'low',
            properties: {},
          },
        ],
        count: 1,
      }),
    });

    // Act
    const extension = await renderTable();

    // Assert
    const cell = extension.getByText('Policy1');
    expect(cell).toBeInTheDocument();

    // simulate user clicking on the policy text
    const user = userEvent.setup();
    await user.click(cell);
    await waitFor(() => {
      const drawer = screen.getByTestId('policy-reports-drawer');
      expect(drawer).toBeInTheDocument();
    });
  });

  it('should call toast api with error from response body when api returns bad response', async () => {
    mockGetNamespacedResults.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: jest.fn().mockResolvedValue({ error: 'Something went wrong' }),
    });

    await renderTable();

    expect(mockToastApiRef.post).toHaveBeenCalledWith({
      title: 'Failed to fetch policies',
      description: 'Something went wrong',
      status: 'danger',
    });
  });

  it('should call toast api with statusText when api returns bad response without error body', async () => {
    mockGetNamespacedResults.mockResolvedValueOnce({
      ok: false,
      status: 503,
      statusText: 'Service Unavailable',
      json: jest.fn().mockResolvedValue({}),
    });

    await renderTable();

    expect(mockToastApiRef.post).toHaveBeenCalledWith({
      title: 'Failed to fetch policies',
      description: 'Service Unavailable',
      status: 'danger',
    });
  });

  it('should call toast api with fallback status message when api returns bad response without error body or statusText', async () => {
    mockGetNamespacedResults.mockResolvedValueOnce({
      ok: false,
      status: 418,
      statusText: '',
      json: jest.fn().mockResolvedValue({}),
    });

    await renderTable();

    expect(mockToastApiRef.post).toHaveBeenCalledWith({
      title: 'Failed to fetch policies',
      description: 'Request failed with status 418',
      status: 'danger',
    });
  });
});
