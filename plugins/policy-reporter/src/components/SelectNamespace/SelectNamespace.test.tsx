import { renderInTestApp } from '@backstage/test-utils';
import { SelectNamespace } from './SelectNamespace';

const setNamespaces = jest.fn();
const availableNamespaces = ['default', 'kube-system'];

describe('SelectNamespace', () => {
    it('should render the selected namespace', async () => {
        const extension = await renderInTestApp(
            <SelectNamespace
                currentNamespaces={['default']}
                setNamespaces={setNamespaces}
                availableNamespaces={availableNamespaces}
            />,
        );
        expect(extension.getByText('default')).toBeTruthy();
        expect(extension.getByText('Namespaces')).toBeTruthy();
    });

    it('should render the selected namespaces', async () => {
        const extension = await renderInTestApp(
            <SelectNamespace
                currentNamespaces={['default', 'kube-system']}
                setNamespaces={setNamespaces}
                availableNamespaces={availableNamespaces}
            />,
        );
        expect(extension.getByText('default, kube-system')).toBeTruthy();
        expect(extension.getByText('Namespaces')).toBeTruthy();
    });

    it('should render all when nothing is selected', async () => {
        const extension = await renderInTestApp(
            <SelectNamespace
                currentNamespaces={[]}
                setNamespaces={setNamespaces}
                availableNamespaces={availableNamespaces}
            />,
        );
        expect(extension.getByText('All')).toBeTruthy();
        expect(extension.getByText('Namespaces')).toBeTruthy();
    });
});
