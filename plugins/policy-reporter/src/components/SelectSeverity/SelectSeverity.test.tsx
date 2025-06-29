import { renderInTestApp } from '@backstage/test-utils';
import { SelectSeverity } from './SelectSeverity';

const setCurrentSeverity = jest.fn();

describe('SelectSeverity', () => {
  it('should render the selected environment', async () => {
    const extension = await renderInTestApp(
      <SelectSeverity
        currentSeverity={['critical']}
        setSeverity={setCurrentSeverity}
      />,
    );
    expect(extension.getByText('critical')).toBeTruthy();
    expect(extension.getByText('Severity')).toBeTruthy();
  });

  it('should render the selected environments', async () => {
    const extension = await renderInTestApp(
      <SelectSeverity
        currentSeverity={['info', 'low']}
        setSeverity={setCurrentSeverity}
      />,
    );
    expect(extension.getByText('info, low')).toBeTruthy();
    expect(extension.getByText('Severity')).toBeTruthy();
  });

  it('should render all when nothing is selected', async () => {
    const extension = await renderInTestApp(
      <SelectSeverity currentSeverity={[]} setSeverity={setCurrentSeverity} />,
    );
    expect(extension.getByText('All')).toBeTruthy();
    expect(extension.getByText('Severity')).toBeTruthy();
  });
});
