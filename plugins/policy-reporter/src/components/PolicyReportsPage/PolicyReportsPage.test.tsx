import { policyReporterApiRef } from '../../api';
import { TestApiProvider, renderInTestApp } from '@backstage/test-utils';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { PolicyReportsPage } from './PolicyReportsPage';

const mockPolicyReportApiRef = {
  namespacedResults: jest.fn(),
};

const mockCatalogApiRef = {
  getEntities: jest.fn(),
};

describe('EntityKyvernoPolicyReportsContent component', () => {
  // TODO: This should be changed when a missing kubernetes-cluster component is implemented
  // For now, we just validate that the component does not render
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

    expect(() => {
      extension.getByText('Policy Reports');
    }).toThrow();
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
    expect(extension.getByText('Failing Policy Results')).toBeTruthy();
    expect(extension.getByText('Passing Policy Results')).toBeTruthy();
    expect(extension.getByText('Skipped Policy Results')).toBeTruthy();
  });
});
