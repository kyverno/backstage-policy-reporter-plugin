import { TestApiProvider, renderInTestApp } from '@backstage/test-utils';
import { toastApiRef } from '@backstage/frontend-plugin-api';
import { waitFor } from '@testing-library/react';
import { policyReporterApiRef } from '../../api';
import { TrivyPoliciesTable } from './TrivyPoliciesTable';
import { EnvironmentProvider } from '../../hooks/useEnvironment';

const mockGetTrivyPolicies = jest.fn();
const mockToast = { post: jest.fn() };

const renderTable = () =>
  renderInTestApp(
    <TestApiProvider
      apis={[
        [
          policyReporterApiRef,
          { getTrivyPolicies: mockGetTrivyPolicies } as any,
        ],
        [toastApiRef, mockToast],
      ]}
    >
      <EnvironmentProvider defaultEnvironment="resource:default/dev">
        <TrivyPoliciesTable />
      </EnvironmentProvider>
    </TestApiProvider>,
  );

describe('TrivyPoliciesTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the vulnerabilities', async () => {
    mockGetTrivyPolicies.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue([
        {
          name: 'CVE-2021-3121',
          title: 'CVE-2021-3121',
          category: 'Vulnerability Scan',
          severity: 'high',
          description: 'An unmarshalling flaw in gogo/protobuf.',
        },
        {
          name: 'GHSA-6vqw-3v5j-54x4',
          title: 'Improper handling of highly compressed data',
          category: 'Vulnerability Scan',
          severity: 'medium',
        },
      ]),
    });

    const extension = await renderTable();

    await waitFor(() =>
      expect(
        extension.getByText('Improper handling of highly compressed data'),
      ).toBeTruthy(),
    );
    // `title` and `name` are identical here, so the cell prints the id once.
    expect(extension.getAllByText('CVE-2021-3121')).toHaveLength(1);
    // This row's `name` differs from its title, so the cell keeps both lines.
    expect(extension.getByText('GHSA-6vqw-3v5j-54x4')).toBeTruthy();
    // The category is the same for every finding, so no column carries it.
    expect(extension.queryByText('Vulnerability Scan')).toBeNull();
    expect(extension.getByText('high')).toBeTruthy();
    expect(
      extension.getByText('An unmarshalling flaw in gogo/protobuf.'),
    ).toBeTruthy();
    expect(mockGetTrivyPolicies).toHaveBeenCalledWith({
      query: { environment: 'resource:default/dev' },
    });
  });

  it('orders the vulnerabilities by severity, most severe first', async () => {
    mockGetTrivyPolicies.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue([
        { name: 'cve-low', title: 'A low finding', severity: 'low' },
        { name: 'cve-none', title: 'An unrated finding' },
        {
          name: 'cve-critical',
          title: 'A critical finding',
          severity: 'critical',
        },
        { name: 'cve-info', title: 'An info finding', severity: 'info' },
        {
          name: 'cve-unknown',
          title: 'An unknown finding',
          severity: 'unknown',
        },
        { name: 'cve-high', title: 'A high finding', severity: 'high' },
        { name: 'cve-medium', title: 'A medium finding', severity: 'medium' },
      ]),
    });

    const extension = await renderTable();

    await waitFor(() =>
      expect(extension.getByText('A critical finding')).toBeTruthy(),
    );

    const rows = extension
      .getAllByRole('row')
      .slice(1)
      .map(row => row.textContent ?? '');

    expect(rows.slice(0, 5)).toEqual([
      expect.stringContaining('A critical finding'),
      expect.stringContaining('A high finding'),
      expect.stringContaining('A medium finding'),
      expect.stringContaining('A low finding'),
      expect.stringContaining('An info finding'),
    ]);
  });

  it('reduces a Markdown description to its leading prose', async () => {
    mockGetTrivyPolicies.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue([
        {
          name: 'GHSA-m425-mq94-257g',
          title: 'gRPC-Go HTTP/2 Rapid Reset vulnerability',
          severity: 'high',
          description: [
            '### Impact',
            'In affected releases of `gRPC-Go`, it is possible for an attacker',
            'to send HTTP/2 requests and cancel them.',
            '',
            '### Patches',
            'Addressed by [#6703](https://github.com/grpc/grpc-go/pull/6703).',
          ].join('\n'),
        },
      ]),
    });

    const extension = await renderTable();

    await waitFor(() =>
      expect(
        extension.getByText(
          'In affected releases of gRPC-Go, it is possible for an attacker to send HTTP/2 requests and cancel them.',
        ),
      ).toBeTruthy(),
    );
    // The `### Impact` heading does not reach the cell.
    expect(extension.queryByText(/### Impact/)).toBeNull();
  });

  it('renders the empty state when no vulnerabilities exist', async () => {
    mockGetTrivyPolicies.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue([]),
    });

    const extension = await renderTable();

    await waitFor(() =>
      expect(extension.getByText('No vulnerabilities found')).toBeTruthy(),
    );
  });

  it('posts a toast when the request fails', async () => {
    mockGetTrivyPolicies.mockResolvedValue({
      ok: false,
      status: 400,
      json: jest.fn().mockResolvedValue({
        error: "Entity missing 'kyverno.io/plugin-trivy-endpoint' annotation",
      }),
    });

    await renderTable();

    await waitFor(() =>
      expect(mockToast.post).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Failed to fetch vulnerabilities',
          description:
            "Entity missing 'kyverno.io/plugin-trivy-endpoint' annotation",
        }),
      ),
    );
  });
});
