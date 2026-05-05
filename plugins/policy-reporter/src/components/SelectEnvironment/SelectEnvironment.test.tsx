import { renderInTestApp } from '@backstage/test-utils';
import { SelectEnvironment } from './SelectEnvironment';
import { Environment } from '@kyverno/backstage-plugin-policy-reporter-common';
import { PolicyReportsFiltersProvider } from '../../hooks/usePolicyReportsFilters';

const environments: Environment[] = [
  { id: 1, entityRef: 'resource:default/dev', name: 'dev' },
  { id: 2, entityRef: 'resource:default/prod', name: 'prod' },
  { id: 3, entityRef: 'resource:default/test', name: 'test' },
];

describe('SelectEnvironment', () => {
  it('should render the current environment from the provider default', async () => {
    const extension = await renderInTestApp(
      <PolicyReportsFiltersProvider defaultEnvironment="resource:default/prod">
        <SelectEnvironment environments={environments} />
      </PolicyReportsFiltersProvider>,
    );

    expect(extension.getAllByText('prod')).toBeTruthy();
  });

  it('should render correctly with a single environment', async () => {
    const environment: Environment = {
      id: 1,
      entityRef: 'resource:default/dev',
      name: 'dev',
    };

    const extension = await renderInTestApp(
      <PolicyReportsFiltersProvider defaultEnvironment="resource:default/dev">
        <SelectEnvironment environments={[environment]} />
      </PolicyReportsFiltersProvider>,
    );

    expect(extension.getByText('Environment')).toBeTruthy();
    expect(extension.getAllByText('dev')).toBeTruthy();
  });
});
