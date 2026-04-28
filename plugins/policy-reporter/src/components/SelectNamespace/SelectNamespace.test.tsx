import { TestApiProvider, renderInTestApp } from '@backstage/test-utils';
import { SelectNamespace } from './SelectNamespace';
import { policyReporterApiRef } from '../../api';

const mockGetNamespaces = jest.fn().mockResolvedValue({
  json: jest.fn().mockResolvedValue(['default', 'kube-system']),
});

const mockPolicyReportApiRef = {
  getNamespaces: mockGetNamespaces,
};

const renderWithEnv = (props: Parameters<typeof SelectNamespace>[0] = {}) =>
  renderInTestApp(
    <TestApiProvider
      apis={[[policyReporterApiRef, mockPolicyReportApiRef as any]]}
    >
      <SelectNamespace {...props} />
    </TestApiProvider>,
    { routeEntries: ['/?environment=resource:default/dev'] },
  );

describe('SelectNamespace', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the selected namespace', async () => {
    const extension = await renderWithEnv({ initialNamespaces: ['default'] });
    expect(extension.getAllByText('default')).toBeTruthy();
    expect(extension.getByText('Namespace')).toBeTruthy();
  });

  it('should render the selected namespaces', async () => {
    const extension = await renderWithEnv({
      initialNamespaces: ['default', 'kube-system'],
    });
    expect(extension.getAllByText('default')).toBeTruthy();
    expect(extension.getAllByText('kube-system')).toBeTruthy();
    expect(extension.getByText('Namespace')).toBeTruthy();
  });

  it('should render all when nothing is selected', async () => {
    const extension = await renderWithEnv();
    expect(extension.getByText('All')).toBeTruthy();
    expect(extension.getByText('Namespace')).toBeTruthy();
  });
});
