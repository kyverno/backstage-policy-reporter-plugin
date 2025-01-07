import React from 'react';
import { kyvernoPolicyReportApiRef } from '../../api';
import { Entity } from '@backstage/catalog-model';
import { TestApiProvider, renderInTestApp } from '@backstage/test-utils';
import { EntityKyvernoPolicyReportsContent } from './EntityKyvernoPolicyReportsContent';
import { EntityProvider, catalogApiRef } from '@backstage/plugin-catalog-react';

const mockKyvernoPolicyReportApiRef = {
  namespacedResults: jest.fn(),
};

const mockCatalogApiRef = {
  getEntitiesByRefs: jest.fn(),
};

const mockEntity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'policy-reporter',
    description: 'Policy-reporter',
    annotations: {
      'kyverno.io/namespace': 'default',
      'kyverno.io/kind': 'deployment',
      'kyverno.io/resource-name': 'policy-reporter',
    },
  },
  spec: {
    type: 'website',
    owner: 'user:guest',
    lifecycle: 'production',
    dependsOn: ['resource:default/dev'],
  },
};

describe('EntityKyvernoPolicyReportsContent component', () => {
  it('should render Missing Annotation when annotations are missing', async () => {
    // Arrange
    // Modify the mock entity to not include annotations
    const mockEntityNoAnnotations: Entity = {
      ...mockEntity,
      metadata: {
        ...mockEntity.metadata,
        annotations: undefined,
      },
    };

    // Act
    const extension = await renderInTestApp(
      <TestApiProvider
        apis={[
          [kyvernoPolicyReportApiRef, mockKyvernoPolicyReportApiRef as any],
          [catalogApiRef, mockCatalogApiRef],
        ]}
      >
        <EntityProvider entity={mockEntityNoAnnotations}>
          <EntityKyvernoPolicyReportsContent />
        </EntityProvider>
        ,
      </TestApiProvider>,
    );

    // Assert
    expect(extension.getAllByText('Missing Annotation')).toBeTruthy();
  });

  it('should render Missing Environments when environment dependency is missing', async () => {
    // Arrange
    // Modify the mock entity to not include annotations
    const mockEntityNoAnnotations: Entity = {
      ...mockEntity,
      spec: {
        ...mockEntity.spec,
        dependsOn: undefined,
      },
    };

    // Act
    const extension = await renderInTestApp(
      <TestApiProvider
        apis={[
          [kyvernoPolicyReportApiRef, mockKyvernoPolicyReportApiRef as any],
          [catalogApiRef, mockCatalogApiRef],
        ]}
      >
        <EntityProvider entity={mockEntityNoAnnotations}>
          <EntityKyvernoPolicyReportsContent />
        </EntityProvider>
        ,
      </TestApiProvider>,
    );

    // Assert
    expect(
      extension.getAllByText('Missing Valid Environment Dependency'),
    ).toBeTruthy();
  });

  it('should render KyvernoPolicyReportsTable if annotations and environments are valid', async () => {
    // Arrange
    mockCatalogApiRef.getEntitiesByRefs.mockImplementationOnce(() => {
      return Promise.resolve({ items: [{ metadata: { name: 'dev' } }] });
    });

    // Act
    const extension = await renderInTestApp(
      <TestApiProvider
        apis={[
          [kyvernoPolicyReportApiRef, mockKyvernoPolicyReportApiRef as any],
          [catalogApiRef, mockCatalogApiRef],
        ]}
      >
        <EntityProvider entity={mockEntity}>
          <EntityKyvernoPolicyReportsContent />
        </EntityProvider>
      </TestApiProvider>,
    );

    // Assert
    expect(extension.getByText('Kyverno Policy Reports')).toBeTruthy();
    expect(extension.getByText('Failing Policy Results')).toBeTruthy();
    expect(extension.getByText('Passing Policy Results')).toBeTruthy();
    expect(extension.getByText('Skipped Policy Results')).toBeTruthy();
  });
});
