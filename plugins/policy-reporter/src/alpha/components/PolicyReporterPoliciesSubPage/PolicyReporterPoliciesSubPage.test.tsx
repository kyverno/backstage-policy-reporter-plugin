import { policyReporterApiRef } from '../../../api';
import { TestApiProvider, renderInTestApp } from '@backstage/test-utils';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { PolicyReporterPoliciesSubPage } from './PolicyReporterPoliciesSubPage.tsx';
import { toastApiRef } from '@backstage/frontend-plugin-api';
import { waitFor } from '@testing-library/react';
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

const mockListResponse = {
  ok: true,
  json: jest.fn().mockResolvedValue(['a', 'b']),
};

const mockGetSources = jest.fn().mockResolvedValue(mockListResponse);
const mockGetKinds = jest.fn().mockResolvedValue(mockListResponse);
const mockGetCategories = jest.fn().mockResolvedValue(mockListResponse);
const mockGetPolicies = jest.fn().mockResolvedValue(mockListResponse);
const mockGetClusterSources = jest.fn().mockResolvedValue(mockListResponse);
const mockGetClusterKinds = jest.fn().mockResolvedValue(mockListResponse);
const mockGetClusterCategories = jest.fn().mockResolvedValue(mockListResponse);
const mockGetClusterPolicies = jest.fn().mockResolvedValue(mockListResponse);

const mockPolicyReportApiRef = {
  getNamespacedResults: mockGetResults,
  getClusterResults: mockGetResults,
  getSources: mockGetSources,
  getKinds: mockGetKinds,
  getCategories: mockGetCategories,
  getPolicies: mockGetPolicies,
  getClusterSources: mockGetClusterSources,
  getClusterKinds: mockGetClusterKinds,
  getClusterCategories: mockGetClusterCategories,
  getClusterPolicies: mockGetClusterPolicies,
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

    it('should fetch filter options from the namespaced endpoints', async () => {
      // Arrange
      mockCatalogApiRef.getEntities.mockImplementationOnce(() => {
        return Promise.resolve({ items: [{ metadata: { name: 'dev' } }] });
      });

      // Act
      await renderInTestApp(
        <TestApiProvider
          apis={[
            [policyReporterApiRef, mockPolicyReportApiRef as any],
            [catalogApiRef, mockCatalogApiRef],
            [toastApiRef, mockToast],
          ]}
        >
          <PolicyReporterPoliciesSubPage
            context="namespaced"
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
        expect(mockGetSources).toHaveBeenCalled();
        expect(mockGetKinds).toHaveBeenCalled();
        expect(mockGetCategories).toHaveBeenCalled();
        expect(mockGetPolicies).toHaveBeenCalled();
      });
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

    it('should fetch filter options from the cluster endpoints', async () => {
      // Arrange
      mockCatalogApiRef.getEntities.mockImplementationOnce(() => {
        return Promise.resolve({ items: [{ metadata: { name: 'dev' } }] });
      });

      // Act
      await renderInTestApp(
        <TestApiProvider
          apis={[
            [policyReporterApiRef, mockPolicyReportApiRef as any],
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
        expect(mockGetClusterSources).toHaveBeenCalled();
        expect(mockGetClusterKinds).toHaveBeenCalled();
        expect(mockGetClusterCategories).toHaveBeenCalled();
        expect(mockGetClusterPolicies).toHaveBeenCalled();
      });
    });
  });
});
