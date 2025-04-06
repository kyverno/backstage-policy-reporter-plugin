import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import {
  policyReporterPlugin,
  EntityKyvernoPoliciesContent,
  EntityCustomPoliciesContent,
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

      'kyverno.io/namespace': 'kyverno',
      'kyverno.io/kind': 'Deployment,Pod',
      'kyverno.io/resource-name': 'kyverno-background-controller',
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
  .registerPlugin(policyReporterPlugin)
  .addPage({
    path: '/kyverno',
    title: 'Kyverno Valid',
    // Wrap the plugin in entity mock
    element: (
      <EntityProvider entity={mockEntity}>
        <EntityKyvernoPoliciesContent
          annotationsDocumentationUrl="https://github.com/"
          policyDocumentationUrl="https://github.com/"
        />
      </EntityProvider>
    ),
  })
  .addPage({
    path: '/kyverno/annotations',
    title: 'Kyverno Missing annotations',
    // Wrap the plugin in entity mock
    element: (
      <EntityProvider entity={mockEntityNoAnnotations}>
        <EntityKyvernoPoliciesContent
          annotationsDocumentationUrl="https://github.com/"
          policyDocumentationUrl="https://github.com/"
        />
      </EntityProvider>
    ),
  })
  .addPage({
    path: '/kyverno/environments',
    title: 'Kyverno Missing environments',
    // Wrap the plugin in entity mock
    element: (
      <EntityProvider entity={mockEntityNoEnvironments}>
        <EntityKyvernoPoliciesContent
          annotationsDocumentationUrl="https://github.com/"
          policyDocumentationUrl="https://github.com/"
        />
      </EntityProvider>
    ),
  })
  .addPage({
    path: '/custom',
    title: 'Custom Valid',
    // Wrap the plugin in entity mock
    element: (
      <EntityProvider entity={mockEntity}>
        <EntityCustomPoliciesContent
          title="Custom Source Policy Reports"
          sources={['kyverno']}
          annotationsDocumentationUrl="https://github.com/"
          policyDocumentationUrl="https://github.com/"
        />
      </EntityProvider>
    ),
  })
  .addPage({
    path: '/custom/environments',
    title: 'Custom Missing environments',
    // Wrap the plugin in entity mock
    element: (
      <EntityProvider entity={mockEntityNoEnvironments}>
        <EntityCustomPoliciesContent
          title="Custom Source Policy Reports"
          sources={['kyverno']}
          annotationsDocumentationUrl="https://github.com/"
          policyDocumentationUrl="https://github.com/"
        />
      </EntityProvider>
    ),
  })
  .addPage({
    path: '/custom/annotations',
    title: 'Custom Missing annotations',
    // Wrap the plugin in entity mock
    element: (
      <EntityProvider entity={mockEntityNoAnnotations}>
        <EntityCustomPoliciesContent
          title="Custom Source Policy Reports"
          sources={['kyverno']}
          annotationsDocumentationUrl="https://github.com/"
          policyDocumentationUrl="https://github.com/"
        />
      </EntityProvider>
    ),
  })
  .render();
