import { renderInTestApp } from '@backstage/test-utils';
import { SelectStatus } from './SelectStatus';

const setCurrentStatus = jest.fn();

describe('SelectStatus', () => {
  it('should render the selected environment', async () => {
    const extension = await renderInTestApp(
      <SelectStatus initialStatus={['fail']} setStatus={setCurrentStatus} />,
    );
    expect(extension.getAllByText('Fail')).toBeTruthy();
    expect(extension.getByText('Status')).toBeTruthy();
  });

  it('should render the selected environments', async () => {
    const extension = await renderInTestApp(
      <SelectStatus
        initialStatus={['fail', 'summary']}
        setStatus={setCurrentStatus}
      />,
    );
    expect(extension.getAllByText('Fail')).toBeTruthy();
    expect(extension.getAllByText('Summary')).toBeTruthy();
    expect(extension.getByText('Status')).toBeTruthy();
  });

  it('should render all when nothing is selected', async () => {
    const extension = await renderInTestApp(
      <SelectStatus initialStatus={[]} setStatus={setCurrentStatus} />,
    );
    expect(extension.getByText('All')).toBeTruthy();
    expect(extension.getByText('Status')).toBeTruthy();
  });
});
