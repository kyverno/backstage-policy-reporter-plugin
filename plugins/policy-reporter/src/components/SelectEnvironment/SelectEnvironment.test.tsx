import React from 'react';
import { renderInTestApp } from '@backstage/test-utils';
import { SelectEnvironment } from './SelectEnvironment';
import { Environment } from '../EntityKyvernoPolicyReportsContent/EntityKyvernoPolicyReportsContent';

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
        currentEnvironment={environments[1]}
        setCurrentEnvironment={setCurrentEnvironment}
      />,
    );

    expect(extension.getByText('prod')).toBeTruthy();
  });
  it('should be disabled if theres only 1 environment', async () => {
    const environment: Environment = {
      id: 1,
      entityRef: 'resource:default/dev',
      name: 'dev',
    };

    // Act
    const extension = await renderInTestApp(
      <SelectEnvironment
        environments={[environment]}
        currentEnvironment={environment}
        setCurrentEnvironment={setCurrentEnvironment}
      />,
    );

    // Assert
    expect(extension.getAllByText('Environment')).toHaveLength(1);
    expect(extension.getByText('dev')).toBeTruthy();
    // The button should be disabled
    expect(extension.getByText('dev')).toHaveClass('Mui-disabled');
  });
});
