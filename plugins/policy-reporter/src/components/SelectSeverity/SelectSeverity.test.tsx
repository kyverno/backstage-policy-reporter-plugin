import { renderInTestApp } from '@backstage/test-utils';
import { SelectSeverity } from './SelectSeverity';

const setCurrentSeverity = jest.fn();

describe('SelectSeverity', () => {
  it('should render the selected environment', async () => {
    const extension = await renderInTestApp(
      <SelectSeverity
        initialSeverity={['critical']}
        setSeverity={setCurrentSeverity}
      />,
    );
    expect(extension.getAllByText('Critical')).toBeTruthy();
    expect(extension.getByText('Severity')).toBeTruthy();
  });

  it('should render the selected environments', async () => {
    const extension = await renderInTestApp(
      <SelectSeverity
        initialSeverity={['info', 'low']}
        setSeverity={setCurrentSeverity}
      />,
    );
    expect(extension.getAllByText('Info')).toBeTruthy();
    expect(extension.getAllByText('Low')).toBeTruthy();
    expect(extension.getByText('Severity')).toBeTruthy();
  });

  it('should render all when nothing is selected', async () => {
    const extension = await renderInTestApp(
      <SelectSeverity initialSeverity={[]} setSeverity={setCurrentSeverity} />,
    );
    expect(extension.getByText('All')).toBeTruthy();
    expect(extension.getByText('Severity')).toBeTruthy();
  });
});
