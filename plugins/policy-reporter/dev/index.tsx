import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import {
  kyvernoPolicyReportsPlugin,
  EntityKyvernoPolicyReportsContent,
} from '../src/plugin';
import { EntityProvider, catalogApiRef } from '@backstage/plugin-catalog-react';
import { Entity } from '@backstage/catalog-model';
import {
  createApiFactory,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/core-plugin-api';
import { CatalogClient } from '@backstage/catalog-client';

const mockEntity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'policy-reporter',
    description: 'Policy-reporter',
    annotations: {
      'github.com/project-slug': 'kyverno/policy-reporter',

      'kyverno.io/namespace': 'default',
      'kyverno.io/kind': 'Deployment,Pod',
      'kyverno.io/resource-name': 'policy-reporter',
    },
  },
  spec: {
    type: 'website',
    owner: 'user:guest',
    lifecycle: 'production',
    dependsOn: [
      'resource:default/dev',
      'resource:default/test',
      'resource:default/database',
    ],
  },
};

const mockEntityNoAnnotations: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'policy-reporter',
    description: 'Policy-reporter',
    annotations: {
      'github.com/project-slug': 'kyverno/policy-reporter',
    },
  },
  spec: {
    type: 'website',
    owner: 'user:guest',
    lifecycle: 'production',
    dependsOn: [
      'resource:default/dev',
      'resource:default/test',
      'resource:default/database',
    ],
  },
};

const mockEntityNoEnvironments: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'policy-reporter',
    description: 'Policy-reporter',
    annotations: {
      'github.com/project-slug': 'kyverno/policy-reporter',

      'kyverno.io/namespace': 'default',
      'kyverno.io/kind': 'Deployment',
      'kyverno.io/resource-name': 'policy-reporter',
    },
  },
  spec: {
    type: 'website',
    owner: 'user:guest',
    lifecycle: 'production',
  },
};

createDevApp()
  .registerApi(
    createApiFactory({
      api: catalogApiRef,
      deps: { fetchApi: fetchApiRef, discoveryApi: discoveryApiRef },
      factory: ({ fetchApi, discoveryApi }) =>
        new CatalogClient({ fetchApi, discoveryApi }),
    }),
  )
  .registerPlugin(kyvernoPolicyReportsPlugin)
  .addPage({
    path: '/catalog-example',
    title: 'Example one',
    // Wrap the plugin in entity mock
    element: (
      <EntityProvider entity={mockEntity}>
        <EntityKyvernoPolicyReportsContent
          annotationsDocumentationUrl="https://github.com/"
          policyDocumentationUrl="https://github.com/"
        />
      </EntityProvider>
    ),
  })
  .addPage({
    path: '/example-2',
    title: 'Missing annotations',
    // Wrap the plugin in entity mock
    element: (
      <EntityProvider entity={mockEntityNoAnnotations}>
        <EntityKyvernoPolicyReportsContent
          annotationsDocumentationUrl="https://github.com/"
          policyDocumentationUrl="https://github.com/"
        />
      </EntityProvider>
    ),
  })
  .addPage({
    path: '/example-3',
    title: 'Missing environments',
    // Wrap the plugin in entity mock
    element: (
      <EntityProvider entity={mockEntityNoEnvironments}>
        <EntityKyvernoPolicyReportsContent
          annotationsDocumentationUrl="https://github.com/"
          policyDocumentationUrl="https://github.com/"
        />
      </EntityProvider>
    ),
  })
  .render();
