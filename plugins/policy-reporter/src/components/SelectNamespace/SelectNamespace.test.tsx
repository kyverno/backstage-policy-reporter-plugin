import { renderInTestApp } from '@backstage/test-utils';
import { SelectNamespace } from './SelectNamespace';

const availableNamespaces = ['default', 'kube-system'];

describe('SelectNamespace', () => {
  it('should render the selected namespace', async () => {
    const extension = await renderInTestApp(
      <SelectNamespace
        initialNamespaces={['default']}
        availableNamespaces={availableNamespaces}
      />,
    );
    expect(extension.getAllByText('default')).toBeTruthy();
    expect(extension.getByText('Namespace')).toBeTruthy();
  });

  it('should render the selected namespaces', async () => {
    const extension = await renderInTestApp(
      <SelectNamespace
        initialNamespaces={['default', 'kube-system']}
        availableNamespaces={availableNamespaces}
      />,
    );
    expect(extension.getAllByText('default')).toBeTruthy();
    expect(extension.getAllByText('kube-system')).toBeTruthy();
    expect(extension.getByText('Namespace')).toBeTruthy();
  });

  it('should render all when nothing is selected', async () => {
    const extension = await renderInTestApp(
      <SelectNamespace availableNamespaces={availableNamespaces} />,
    );
    expect(extension.getByText('All')).toBeTruthy();
    expect(extension.getByText('Namespace')).toBeTruthy();
  });
});
