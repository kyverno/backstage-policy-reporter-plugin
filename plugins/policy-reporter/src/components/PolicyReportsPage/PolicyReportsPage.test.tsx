import { policyReporterApiRef } from '../../api';
import { TestApiProvider, renderInTestApp } from '@backstage/test-utils';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { PolicyReportsPage } from './PolicyReportsPage';

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

const mockCatalogApiRef = {
  getEntities: jest.fn(),
};

describe('EntityKyvernoPolicyReportsContent component', () => {
  it('should not render when kubernetes-cluster resources are missing', async () => {
    // Act
    const extension = await renderInTestApp(
      <TestApiProvider
        apis={[
          [policyReporterApiRef, mockPolicyReportApiRef as any],
          [catalogApiRef, mockCatalogApiRef],
        ]}
      >
        <PolicyReportsPage />,
      </TestApiProvider>,
    );

    // Assert
    expect(
      extension.getByText('No kubernetes-cluster Resources found'),
    ).toBeTruthy();

    expect(extension.getByText('Policy Reports')).toBeTruthy();
  });

  it('should render PolicyReportsTable if environments are valid', async () => {
    // Arrange
    mockCatalogApiRef.getEntities.mockImplementationOnce(() => {
      return Promise.resolve({ items: [{ metadata: { name: 'dev' } }] });
    });

    // Act
    const extension = await renderInTestApp(
      <TestApiProvider
        apis={[
          [policyReporterApiRef, mockPolicyReportApiRef as any],
          [catalogApiRef, mockCatalogApiRef],
        ]}
      >
        <PolicyReportsPage />
      </TestApiProvider>,
    );

    // Assert
    expect(extension.getByText('Policy Reports')).toBeTruthy();
    expect(extension.getByText('Policy Results')).toBeTruthy();
  });
});
