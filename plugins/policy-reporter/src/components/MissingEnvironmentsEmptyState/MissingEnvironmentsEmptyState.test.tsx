import { Entity } from '@backstage/catalog-model';
import { MissingEnvironmentsEmptyState } from './MissingEnvironmentsEmptyState';
import { renderInTestApp } from '@backstage/test-utils';

describe('MissingEnvironmentsEmptyState', () => {
  it('should render empty state component with undefined entity', async () => {
    const extension = await renderInTestApp(<MissingEnvironmentsEmptyState />);

    expect(
      extension.getAllByText('Missing Valid Environment Dependency'),
    ).toBeTruthy();
  });

  it('should render empty state component with entity', async () => {
    const entity: Entity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'custom-resource',
      metadata: {
        name: 'service-name',
      },
      spec: {
        type: 'custom-type',
        owner: 'user:namespace/name',
      },
    };

    const extension = await renderInTestApp(
      <MissingEnvironmentsEmptyState entity={entity} />,
    );

    expect(
      extension.getAllByText('Missing Valid Environment Dependency'),
    ).toBeTruthy();
  });
});
