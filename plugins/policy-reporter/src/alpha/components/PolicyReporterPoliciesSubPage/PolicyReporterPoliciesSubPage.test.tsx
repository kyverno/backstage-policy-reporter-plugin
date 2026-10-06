import { policyReporterApiRef } from '../../../api';
import { TestApiProvider, renderInTestApp } from '@backstage/test-utils';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { PolicyReporterPoliciesSubPage } from './PolicyReporterPoliciesSubPage.tsx';
import { toastApiRef } from '@backstage/frontend-plugin-api';
import { screen, waitFor } from '@testing-library/react';
import { SelectSource } from '../../../components/SelectSource';
import { SelectKind } from '../../../components/SelectKind';
import { SelectCategory } from '../../../components/SelectCategory';
import { SelectPolicy } from '../../../components/SelectPolicy';

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

    it('should fetch options from the cluster endpoints for the configured filters', async () => {
      // Arrange
      mockCatalogApiRef.getEntities.mockImplementationOnce(() => {
        return Promise.resolve({ items: [{ metadata: { name: 'dev' } }] });
      });
      const listResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(['a', 'b']),
      };
      const mockClusterApi = {
        ...mockPolicyReportApiRef,
        getClusterSources: jest.fn().mockResolvedValue(listResponse),
        getClusterKinds: jest.fn().mockResolvedValue(listResponse),
        getClusterCategories: jest.fn().mockResolvedValue(listResponse),
        getClusterPolicies: jest.fn().mockResolvedValue(listResponse),
        getSources: jest.fn(),
        getKinds: jest.fn(),
        getCategories: jest.fn(),
        getPolicies: jest.fn(),
      };

      // Act
      await renderInTestApp(
        <TestApiProvider
          apis={[
            [policyReporterApiRef, mockClusterApi as any],
            [catalogApiRef, mockCatalogApiRef],
            [toastApiRef, mockToast],
          ]}
        >
          <PolicyReporterPoliciesSubPage
            context="cluster"
            filters={
              <>
                <SelectSource />
                <SelectKind />
                <SelectCategory />
                <SelectPolicy />
              </>
            }
          />
        </TestApiProvider>,
      );

      // Assert
      await waitFor(() => {
        expect(mockClusterApi.getClusterSources).toHaveBeenCalled();
        expect(mockClusterApi.getClusterKinds).toHaveBeenCalled();
        expect(mockClusterApi.getClusterCategories).toHaveBeenCalled();
        expect(mockClusterApi.getClusterPolicies).toHaveBeenCalled();
      });
      expect(mockClusterApi.getSources).not.toHaveBeenCalled();
      expect(mockClusterApi.getKinds).not.toHaveBeenCalled();
      expect(mockClusterApi.getCategories).not.toHaveBeenCalled();
      expect(mockClusterApi.getPolicies).not.toHaveBeenCalled();
      expect(() => screen.getAllByText('Namespace')).toThrow();
    });
  });
});
