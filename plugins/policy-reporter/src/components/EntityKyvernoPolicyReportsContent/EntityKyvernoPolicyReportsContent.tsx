import {
  Content,
  ContentHeader,
  Page,
  Progress,
} from '@backstage/core-components';
import React from 'react';
import {
  MissingAnnotationEmptyState,
  useEntity,
} from '@backstage/plugin-catalog-react';
import { Grid } from '@material-ui/core';
import { KyvernoPolicyReportsTable } from '../KyvernoPolicyReportsTable';
import { SelectEnvironment } from '../SelectEnvironment';
import {
  containsRequiredAnnotations,
  annotationsRequired,
} from '../../utils/annotations';
import { MissingEnvironmentsEmptyState } from '../MissingEnvironmentsEmptyState';
import { useEntityEnvironment } from '../../hooks/useEntityEnvironment';
import {
  KYVERNO_KIND_ANNOTATION,
  KYVERNO_NAMESPACE_ANNOTATION,
  KYVERNO_RESOURCE_NAME_ANNOTATION,
} from 'backstage-plugin-policy-reporter-common';

type KyvernoPolicyReportsContentProps = {
  annotationsDocumentationUrl?: string;
  policyDocumentationUrl?: string;
};

export type Environment = {
  id: number;
  entityRef: string;
  name: string;
};

type PageContentProps = {
  children: React.ReactNode;
};

const PageContent = ({ children }: PageContentProps) => (
  <Page themeId="tool">
    <Content>{children}</Content>
  </Page>
);

export const EntityKyvernoPolicyReportsContent = ({
  annotationsDocumentationUrl,
  policyDocumentationUrl,
}: KyvernoPolicyReportsContentProps) => {
  const { entity } = useEntity();
  const annotations = entity.metadata.annotations;

  // Boolean variable to validate that entity have required annotations
  const annotationsState: boolean = containsRequiredAnnotations(annotations);

  const {
    environments,
    environmentsLoading,
    setCurrentEnvironment,
    currentEnvironment,
  } = useEntityEnvironment(entity, annotationsState);

  // Annotations missing
  if (!annotationsState)
    return (
      <PageContent>
        <MissingAnnotationEmptyState
          readMoreUrl={annotationsDocumentationUrl}
          annotation={annotationsRequired}
        />
      </PageContent>
    );

  // Fetching environments
  if (environmentsLoading) return <Progress />;

  // Environments missing
  if (environments === undefined || !currentEnvironment)
    return (
      <PageContent>
        <MissingEnvironmentsEmptyState entity={entity} />
      </PageContent>
    );

  const namespaces = annotations![KYVERNO_NAMESPACE_ANNOTATION].split(',');
  const kinds = annotations![KYVERNO_KIND_ANNOTATION].split(',');
  const resourceName = annotations![KYVERNO_RESOURCE_NAME_ANNOTATION];

  return (
    <PageContent>
      <ContentHeader title="Kyverno Policy Reports">
        <SelectEnvironment
          environments={environments}
          currentEnvironment={currentEnvironment}
          setCurrentEnvironment={setCurrentEnvironment}
        />
      </ContentHeader>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <KyvernoPolicyReportsTable
            currentEnvironment={currentEnvironment}
            filter={{
              namespaces,
              kinds,
              status: ['fail'],
              search: resourceName,
            }}
            title="Failing Policy Results"
            emptyContentText="No failing policies"
            policyDocumentationUrl={policyDocumentationUrl}
          />
        </Grid>
        <Grid item xs={12}>
          <KyvernoPolicyReportsTable
            currentEnvironment={currentEnvironment}
            filter={{
              namespaces,
              kinds,
              status: ['pass'],
              search: resourceName,
            }}
            title="Passing Policy Results"
            emptyContentText="No passing policies"
            policyDocumentationUrl={policyDocumentationUrl}
          />
        </Grid>
        <Grid item xs={12}>
          <KyvernoPolicyReportsTable
            currentEnvironment={currentEnvironment}
            filter={{
              namespaces,
              kinds,
              status: ['skip'],
              search: resourceName,
            }}
            title="Skipped Policy Results"
            emptyContentText="No skipped policies"
            policyDocumentationUrl={policyDocumentationUrl}
          />
        </Grid>
      </Grid>
    </PageContent>
  );
};
