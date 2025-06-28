import { PolicyReportsDrawerComponent } from './PolicyReportsDrawerComponent';
import { renderInTestApp } from '@backstage/test-utils';
import { ListResult } from '@kyverno/backstage-plugin-policy-reporter-common';

describe('PolicyReportsDrawerComponent', () => {
  it('should render table displaying the policy details', async () => {
    const data: ListResult = {
      id: '0',
      kind: 'deployment',
      namespace: 'default',
      name: 'name',
      resourceId: 'id',
      message: 'Policy 1 passed successfully',
      timestamp: 123456789,
      policy: 'Policy1',
      rule: 'Rule1',
      status: 'pass',
      severity: 'low',
      properties: {},
    };

    const extension = await renderInTestApp(
      <PolicyReportsDrawerComponent content={data} />,
    );

    expect(extension.getAllByText('Policy1')).toHaveLength(1);
  });

  it('should render table displaying the policy details with additonal properties', async () => {
    const data: ListResult = {
      id: '0',
      kind: 'deployment',
      namespace: 'default',
      name: 'name',
      resourceId: 'id',
      message: 'Policy 1 passed successfully',
      timestamp: 123456789,
      policy: 'Policy1',
      rule: 'Rule1',
      status: 'pass',
      severity: 'low',
      properties: {
        key: 'value',
      },
    };

    const extension = await renderInTestApp(
      <PolicyReportsDrawerComponent content={data} />,
    );

    expect(extension.getAllByText('Policy1')).toBeTruthy();
    expect(extension.getAllByText('key')).toBeTruthy();
    expect(extension.getAllByText('value')).toBeTruthy();
    expect(extension.getAllByText('Additional Properties')).toBeTruthy();
  });

  it('should render message if policy is undefined', async () => {
    const extension = await renderInTestApp(
      <PolicyReportsDrawerComponent content={undefined} />,
    );

    expect(
      extension.getAllByText('No policy information available'),
    ).toBeTruthy();
  });
});
