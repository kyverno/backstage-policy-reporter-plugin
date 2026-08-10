import { policyReporterApiRef } from '../../../api';
import { TestApiProvider, renderInTestApp } from '@backstage/test-utils';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { PolicyReporterPoliciesSubPage } from './PolicyReporterPoliciesSubPage.tsx';
import { toastApiRef } from '@backstage/frontend-plugin-api';

const mockGetResults = jest.fn().mockResolvedValue({
  json: jest.fn().mockResolvedValue({
    items: [],
    count: 0,
    page: 1,
    offset: 5,
    total: 0,
  }),
});

const mockPolicyReportApiRef = {
  getNamespacedResults: mockGetResults,
  getClusterResults: mockGetResults,
};

const mockCatalogApiRef = {
  getEntities: jest.fn(),
};

const mockToast = {
  post: jest.fn(),
};

describe('PolicyReporterPoliciesSubPage component', () => {
  describe('Namespaced Context', () => {
    it('should not render when kubernetes-cluster resources are missing', async () => {
      // Act
      const extension = await renderInTestApp(
        <TestApiProvider
          apis={[
            [policyReporterApiRef, mockPolicyReportApiRef as any],
            [catalogApiRef, mockCatalogApiRef],
            [toastApiRef, mockToast],
          ]}
        >
          <PolicyReporterPoliciesSubPage context="namespaced" />,
        </TestApiProvider>,
      );

      // Assert
      expect(
        extension.getByText('No kubernetes-cluster Resources found'),
      ).toBeTruthy();
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
            [toastApiRef, mockToast],
          ]}
        >
          <PolicyReporterPoliciesSubPage context="namespaced" />
        </TestApiProvider>,
      );

      // Assert
      expect(extension.getAllByText('Name')).toBeTruthy();
      expect(extension.getAllByText('Namespace')).toBeTruthy();
      expect(extension.getAllByText('Kind')).toBeTruthy();
      expect(extension.getAllByText('Policy')).toBeTruthy();
    });
  });

  describe('Cluster Context', () => {
    it('should not render when kubernetes-cluster resources are missing', async () => {
      // Act
      const extension = await renderInTestApp(
        <TestApiProvider
          apis={[
            [policyReporterApiRef, mockPolicyReportApiRef as any],
            [catalogApiRef, mockCatalogApiRef],
            [toastApiRef, mockToast],
          ]}
        >
          <PolicyReporterPoliciesSubPage context="cluster" />,
        </TestApiProvider>,
      );

      // Assert
      expect(
        extension.getByText('No kubernetes-cluster Resources found'),
      ).toBeTruthy();
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
            [toastApiRef, mockToast],
          ]}
        >
          <PolicyReporterPoliciesSubPage context="cluster" />
        </TestApiProvider>,
      );

      // Assert
      expect(extension.getAllByText('Name')).toBeTruthy();
      expect(() => extension.getAllByText('Namespace')).toThrow();
      expect(extension.getAllByText('Kind')).toBeTruthy();
      expect(extension.getAllByText('Policy')).toBeTruthy();
    });
  });
});
