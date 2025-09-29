import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';
import { TestApiProvider, renderInTestApp } from '@backstage/test-utils';
import { PolicyReportsTable } from './PolicyReportsTable';
import { policyReporterApiRef } from '../../api';

const mockGetNamespacedResults = jest.fn().mockResolvedValue({
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

describe('KyvernoPolicyReportsTable', () => {
  it('should render table displaying the fetched data', async () => {
    // Arrange
    mockGetNamespacedResults.mockResolvedValueOnce({
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
    const extension = await renderInTestApp(
      <TestApiProvider
        apis={[[policyReporterApiRef, mockPolicyReportApiRef as any]]}
      >
        <PolicyReportsTable
          currentEnvironment={{
            id: 1,
            name: 'dev',
            entityRef: 'resource:default/dev',
          }}
          filter={{}}
          title="Policy Results"
          emptyContentText="empty"
        />
        ,
      </TestApiProvider>,
    );

    expect(extension.getAllByText('Policy Results')).toHaveLength(1);
    expect(extension.getAllByText('Policy1')).toHaveLength(1);
    expect(extension.getAllByText('Rule1')).toHaveLength(1);
  });
  it('should render table displaying the emptyContentText when there are no policies', async () => {
    // Arrange
    mockGetNamespacedResults.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue({
        items: [],
        count: 0,
      }),
    });

    // Act
    const extension = await renderInTestApp(
      <TestApiProvider
        apis={[[policyReporterApiRef, mockPolicyReportApiRef as any]]}
      >
        <PolicyReportsTable
          currentEnvironment={{
            id: 1,
            name: 'dev',
            entityRef: 'resource:default/dev',
          }}
          filter={{}}
          title="Policy Results"
          emptyContentText="there are no policies"
        />
        ,
      </TestApiProvider>,
    );

    expect(extension.getAllByText('Policy Results')).toHaveLength(1);
    expect(extension.getAllByText('there are no policies')).toHaveLength(1);
  });

  it('should render the table displaying loading icon when data is undefined', async () => {
    // Arrange
    mockGetNamespacedResults.mockImplementationOnce(() => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            json: jest.fn().mockResolvedValue({}),
          });
        }, 1000);
      });
    });

    // Act
    const extension = await renderInTestApp(
      <TestApiProvider
        apis={[[policyReporterApiRef, mockPolicyReportApiRef as any]]}
      >
        <PolicyReportsTable
          currentEnvironment={{
            id: 1,
            name: 'dev',
            entityRef: 'resource:default/dev',
          }}
          filter={{}}
          title="Policy Results"
          emptyContentText="empty"
        />
        ,
      </TestApiProvider>,
    );

    expect(extension.getAllByText('Policy Results')).toHaveLength(1);
    expect(extension.getByRole('progressbar')).toBeTruthy();
  });

  it('should render ResponseErrorPanel when fetching data fails', async () => {
    // Arrange
    // Change the mock implementation of the getPolicies method to throw an error
    mockGetNamespacedResults.mockRejectedValueOnce(
      new Error('Failed to fetch policies'),
    );

    // Act
    const extension = await renderInTestApp(
      <TestApiProvider
        apis={[[policyReporterApiRef, mockPolicyReportApiRef as any]]}
      >
        <PolicyReportsTable
          currentEnvironment={{
            id: 1,
            name: 'dev',
            entityRef: 'resource:default/dev',
          }}
          filter={{}}
          title="Policy Results"
          emptyContentText="there are no policies"
        />
        ,
      </TestApiProvider>,
    );

    expect(extension.getByText('Error: Failed to fetch policies')).toBeTruthy();
  });

  it('should render Drawer when clicking on a policy', async () => {
    // Arrange
    mockGetNamespacedResults.mockResolvedValueOnce({
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
    const extension = await renderInTestApp(
      <TestApiProvider
        apis={[[policyReporterApiRef, mockPolicyReportApiRef as any]]}
      >
        <PolicyReportsTable
          currentEnvironment={{
            id: 1,
            name: 'dev',
            entityRef: 'resource:default/dev',
          }}
          filter={{}}
          title="Policy Results"
          emptyContentText="empty"
        />
        ,
      </TestApiProvider>,
    );
    //

    // Assert
    const cell = extension.getByRole('cell', {
      name: 'name',
    });
    expect(cell).toBeInTheDocument();

    // simulate user clicking on a cell
    const user = userEvent.setup();
    await user.click(cell);
    await waitFor(() => {
      const drawer = screen.getByTestId('policy-reports-drawer');
      expect(drawer).toBeInTheDocument();
    });
  });
});
