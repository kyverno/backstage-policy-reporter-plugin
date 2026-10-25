import { TestApiProvider, renderInTestApp } from '@backstage/test-utils';
import { toastApiRef } from '@backstage/frontend-plugin-api';
import { waitFor } from '@testing-library/react';
import { policyReporterApiRef } from '../../api';
import { VapPoliciesTable } from './VapPoliciesTable';

const mockGetVapPolicies = jest.fn();
const mockToast = { post: jest.fn() };

const renderTable = () =>
  renderInTestApp(
    <TestApiProvider
      apis={[
        [policyReporterApiRef, { getVapPolicies: mockGetVapPolicies } as any],
        [toastApiRef, mockToast],
      ]}
    >
      <VapPoliciesTable environment="resource:default/dev" />
    </TestApiProvider>,
  );

describe('VapPoliciesTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the policies', async () => {
    mockGetVapPolicies.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue([
        {
          name: 'require-labels',
          title: 'Require Labels',
          category: 'Best Practices',
          severity: 'medium',
          description: 'Require app labels',
        },
        {
          name: 'deny-privileged',
          title: 'Deny Privileged',
          category: 'Pod Security',
          severity: 'high',
        },
      ]),
    });

    const extension = await renderTable();

    await waitFor(() =>
      expect(extension.getByText('Deny Privileged')).toBeTruthy(),
    );
    expect(extension.getByText('Require Labels')).toBeTruthy();
    expect(extension.getByText('deny-privileged')).toBeTruthy();
    expect(extension.getByText('Pod Security')).toBeTruthy();
    expect(extension.getByText('high')).toBeTruthy();
    expect(extension.getByText('Require app labels')).toBeTruthy();
    expect(mockGetVapPolicies).toHaveBeenCalledWith({
      query: { environment: 'resource:default/dev' },
    });
  });

  it('renders the empty state when no policies exist', async () => {
    mockGetVapPolicies.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue([]),
    });

    const extension = await renderTable();

    await waitFor(() =>
      expect(
        extension.getByText('No validating admission policies found'),
      ).toBeTruthy(),
    );
  });

  it('posts a toast when the request fails', async () => {
    mockGetVapPolicies.mockResolvedValue({
      ok: false,
      status: 400,
      json: jest.fn().mockResolvedValue({
        error: "Entity missing 'kyverno.io/plugin-vap-endpoint' annotation",
      }),
    });

    await renderTable();

    await waitFor(() =>
      expect(mockToast.post).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Failed to fetch validating admission policies',
          description:
            "Entity missing 'kyverno.io/plugin-vap-endpoint' annotation",
        }),
      ),
    );
  });
});
