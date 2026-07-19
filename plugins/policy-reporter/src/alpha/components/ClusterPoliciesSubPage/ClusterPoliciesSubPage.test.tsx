import { policyReporterApiRef } from '../../api';
import { TestApiProvider, renderInTestApp } from '@backstage/test-utils';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { toastApiRef } from '@backstage/frontend-plugin-api';
import { ClusterPoliciesSubPage } from './ClusterPoliciesSubPage.tsx';

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

const mockToast = {
  post: jest.fn(),
};

describe('ClusterPoliciesSubPage component', () => {
  it('should not render when kubernetes-cluster resources are missing', async () => {
    // Act
    const extension = await renderInTestApp(
      <TestApiProvider
        apis={[
          [policyReporterApiRef, mockPolicyReportApiRef],
          [catalogApiRef, mockCatalogApiRef],
          [toastApiRef, mockToast],
        ]}
      >
        <ClusterPoliciesSubPage />,
      </TestApiProvider>,
    );

    // Assert
    expect(
      extension.getByText('No kubernetes-cluster Resources found'),
    ).toBeTruthy();
  });

  it('should render ClusterPoliciesSubPage if environments are valid', async () => {
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
          [toastApiRef, mockToast],
        ]}
      >
        <ClusterPoliciesSubPage />
      </TestApiProvider>,
    );

    // Assert
    expect(extension.getAllByText('Name')).toBeTruthy();
    expect(extension.getAllByText('Kind')).toBeTruthy();
    expect(extension.getAllByText('Policy')).toBeTruthy();

    expect(extension.getAllByText('Namespace')).toBeFalsy();
  });
});
