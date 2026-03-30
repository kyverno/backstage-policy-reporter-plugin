import {
  Content,
  ContentHeader,
  Page,
  Progress,
} from '@backstage/core-components';
import {
  MissingAnnotationEmptyState,
  useEntity,
} from '@backstage/plugin-catalog-react';
import { Grid } from '@material-ui/core';
import { PolicyReportsTable } from '../PolicyReportsTable';
import { SelectEnvironment } from '../SelectEnvironment';
import {
  getKinds,
  getNamespaces,
  getResourceName,
  isPolicyReporterAvailable,
} from '../../utils/annotations';
import { MissingEnvironmentsEmptyState } from '../MissingEnvironmentsEmptyState';
import { useEntityEnvironment } from '../../hooks/useEntityEnvironment';
import { KYVERNO_RESOURCE_NAME_ANNOTATION } from '@kyverno/backstage-plugin-policy-reporter-common';

type KyvernoPoliciesContentProps = {
  annotationsDocumentationUrl?: string;
};

type PageContentProps = {
  children: React.ReactNode;
};

const PageContent = ({ children }: PageContentProps) => (
  <Page themeId="tool">
    <Content>{children}</Content>
  </Page>
);

export const EntityKyvernoPoliciesContent = ({
  annotationsDocumentationUrl,
}: KyvernoPoliciesContentProps) => {
  const { entity } = useEntity();
  const annotations = entity.metadata.annotations;

  // Boolean variable to validate that entity have required annotations
  const annotationsState = isPolicyReporterAvailable(entity);

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
          annotation={KYVERNO_RESOURCE_NAME_ANNOTATION}
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

  const namespaces = getNamespaces(annotations);
  const kinds = getKinds(annotations);
  const resourceName = getResourceName(annotations);

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
          <PolicyReportsTable
            currentEnvironment={currentEnvironment}
            filter={{
              namespaces,
              sources: ['kyverno'],
              kinds,
              status: ['fail'],
              search: resourceName,
            }}
            emptyContentText="No policies found"
            enableSearch={false}
          />
        </Grid>
      </Grid>
    </PageContent>
  );
};
