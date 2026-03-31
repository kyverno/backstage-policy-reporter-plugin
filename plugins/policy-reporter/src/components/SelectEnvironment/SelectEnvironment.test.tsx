import { renderInTestApp } from '@backstage/test-utils';
import { SelectEnvironment } from './SelectEnvironment';
import { Environment } from '@kyverno/backstage-plugin-policy-reporter-common';

const setCurrentEnvironment = jest.fn();

const environments: Environment[] = [
  { id: 1, entityRef: 'resource:default/dev', name: 'dev' },
  { id: 2, entityRef: 'resource:default/prod', name: 'prod' },
  { id: 3, entityRef: 'resource:default/test', name: 'test' },
];

describe('SelectEnvironment', () => {
  it('should render the current environment if something is selected', async () => {
    // Act
    const extension = await renderInTestApp(
      <SelectEnvironment
        environments={environments}
        initialEnvironment={environments[1]}
        setCurrentEnvironment={setCurrentEnvironment}
      />,
    );

    expect(extension.getAllByText('prod')).toBeTruthy();
  });
  it('should render correctly with a single environment', async () => {
    const environment: Environment = {
      id: 1,
      entityRef: 'resource:default/dev',
      name: 'dev',
    };

    // Act
    const extension = await renderInTestApp(
      <SelectEnvironment
        environments={[environment]}
        initialEnvironment={environment}
        setCurrentEnvironment={setCurrentEnvironment}
      />,
    );

    // Assert
    expect(extension.getByText('Environment')).toBeTruthy();
    expect(extension.getAllByText('dev')).toBeTruthy();
  });
});
