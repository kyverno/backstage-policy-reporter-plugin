import { renderInTestApp } from '@backstage/test-utils';
import { SelectStatus } from './SelectStatus';

describe('SelectStatus', () => {
  it('should render the selected environment', async () => {
    const extension = await renderInTestApp(
      <SelectStatus initialStatus={['fail']} />,
    );
    expect(extension.getAllByText('Fail')).toBeTruthy();
    expect(extension.getByText('Status')).toBeTruthy();
  });

  it('should render the selected environments', async () => {
    const extension = await renderInTestApp(
      <SelectStatus initialStatus={['fail', 'summary']} />,
    );
    expect(extension.getAllByText('Fail')).toBeTruthy();
    expect(extension.getAllByText('Summary')).toBeTruthy();
    expect(extension.getByText('Status')).toBeTruthy();
  });

  it('should render all when nothing is selected', async () => {
    const extension = await renderInTestApp(
      <SelectStatus initialStatus={[]} />,
    );
    expect(extension.getByText('All')).toBeTruthy();
    expect(extension.getByText('Status')).toBeTruthy();
  });
});
