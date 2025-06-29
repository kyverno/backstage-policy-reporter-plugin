import { renderInTestApp } from '@backstage/test-utils';
import { SelectStatus } from './SelectStatus';

const setCurrentStatus = jest.fn();

describe('SelectStatus', () => {
  it('should render the selected environment', async () => {
    const extension = await renderInTestApp(
      <SelectStatus currentStatus={['fail']} setStatus={setCurrentStatus} />,
    );
    expect(extension.getByText('fail')).toBeTruthy();
    expect(extension.getByText('Status')).toBeTruthy();
  });

  it('should render the selected environments', async () => {
    const extension = await renderInTestApp(
      <SelectStatus
        currentStatus={['fail', 'summary']}
        setStatus={setCurrentStatus}
      />,
    );
    expect(extension.getByText('fail, summary')).toBeTruthy();
    expect(extension.getByText('Status')).toBeTruthy();
  });

  it('should render all when nothing is selected', async () => {
    const extension = await renderInTestApp(
      <SelectStatus currentStatus={[]} setStatus={setCurrentStatus} />,
    );
    expect(extension.getByText('All')).toBeTruthy();
    expect(extension.getByText('Status')).toBeTruthy();
  });
});
