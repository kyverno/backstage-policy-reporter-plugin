import React from 'react';
import { TestApiProvider, renderInTestApp } from '@backstage/test-utils';
import { KyvernoPolicyReportsTable } from './KyvernoPolicyReportsTable';
import { kyvernoPolicyReportApiRef } from '../../api';

const mockKyvernoPolicyReportApiRef = {
  namespacedResults: jest.fn(),
};

describe('KyvernoPolicyReportsTable', () => {
  it('should render table displaying the fetched data', async () => {
    // Arrange
    mockKyvernoPolicyReportApiRef.namespacedResults.mockImplementationOnce(() =>
      Promise.resolve({
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
    );

    // Act
    const extension = await renderInTestApp(
      <TestApiProvider
        apis={[
          [kyvernoPolicyReportApiRef, mockKyvernoPolicyReportApiRef as any],
        ]}
      >
        <KyvernoPolicyReportsTable
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
    mockKyvernoPolicyReportApiRef.namespacedResults.mockImplementationOnce(() =>
      Promise.resolve({
        items: [],
        count: 0,
      }),
    );

    // Act
    const extension = await renderInTestApp(
      <TestApiProvider
        apis={[
          [kyvernoPolicyReportApiRef, mockKyvernoPolicyReportApiRef as any],
        ]}
      >
        <KyvernoPolicyReportsTable
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
    mockKyvernoPolicyReportApiRef.namespacedResults.mockImplementationOnce(
      () => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({});
          }, 1000);
        });
      },
    );

    // Act
    const extension = await renderInTestApp(
      <TestApiProvider
        apis={[
          [kyvernoPolicyReportApiRef, mockKyvernoPolicyReportApiRef as any],
        ]}
      >
        <KyvernoPolicyReportsTable
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
    mockKyvernoPolicyReportApiRef.namespacedResults.mockImplementationOnce(() =>
      Promise.reject(new Error('Failed to fetch policies')),
    );

    // Act
    const extension = await renderInTestApp(
      <TestApiProvider
        apis={[
          [kyvernoPolicyReportApiRef, mockKyvernoPolicyReportApiRef as any],
        ]}
      >
        <KyvernoPolicyReportsTable
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
});
