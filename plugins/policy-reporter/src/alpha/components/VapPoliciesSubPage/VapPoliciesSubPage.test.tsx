import { TestApiProvider, renderInTestApp } from '@backstage/test-utils';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { toastApiRef } from '@backstage/frontend-plugin-api';
import { waitFor } from '@testing-library/react';
import { policyReporterApiRef } from '../../../api';
import { VapPoliciesSubPage } from './VapPoliciesSubPage';

const mockGetVapPolicies = jest.fn().mockResolvedValue({
  ok: true,
  json: jest.fn().mockResolvedValue([]),
});

const mockCatalogApiRef = {
  getEntities: jest.fn(),
};

const mockToast = {
  post: jest.fn(),
};

const renderSubPage = () =>
  renderInTestApp(
    <TestApiProvider
      apis={[
        [policyReporterApiRef, { getVapPolicies: mockGetVapPolicies } as any],
        [catalogApiRef, mockCatalogApiRef],
        [toastApiRef, mockToast],
      ]}
    >
      <VapPoliciesSubPage />
    </TestApiProvider>,
  );

describe('VapPoliciesSubPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('only looks up clusters with the VAP plugin annotation', async () => {
    mockCatalogApiRef.getEntities.mockResolvedValueOnce({ items: [] });

    await renderSubPage();

    expect(mockCatalogApiRef.getEntities).toHaveBeenCalledWith(
      expect.objectContaining({
        filter: expect.objectContaining({
          'metadata.annotations.kyverno.io/plugin-vap-endpoint':
            expect.anything(),
        }),
      }),
    );
  });

  it('renders the empty state when no cluster has the VAP plugin annotation', async () => {
    mockCatalogApiRef.getEntities.mockResolvedValueOnce({ items: [] });

    const extension = await renderSubPage();

    expect(
      extension.getByText(
        'No kubernetes-cluster Resources with the VAP plugin found',
      ),
    ).toBeTruthy();
  });

  it('renders the table for the first environment', async () => {
    mockCatalogApiRef.getEntities.mockResolvedValueOnce({
      items: [
        { kind: 'Resource', metadata: { name: 'dev', namespace: 'default' } },
        { kind: 'Resource', metadata: { name: 'prod', namespace: 'default' } },
      ],
    });

    const extension = await renderSubPage();

    expect(extension.getByText('Environment')).toBeTruthy();
    expect(extension.getAllByText('Title')).toBeTruthy();
    expect(extension.getAllByText('Category')).toBeTruthy();
    await waitFor(() =>
      expect(mockGetVapPolicies).toHaveBeenCalledWith({
        query: { environment: 'Resource:default/dev' },
      }),
    );
  });
});
