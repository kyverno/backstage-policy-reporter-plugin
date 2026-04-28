import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Content, Progress } from '@backstage/core-components';
import {
  MissingAnnotationEmptyState,
  useEntity,
} from '@backstage/plugin-catalog-react';
import { Container, Grid, HeaderPage } from '@backstage/ui';
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
import { useFilterParams } from '../../hooks/useFilterParams';
import { KYVERNO_RESOURCE_NAME_ANNOTATION } from '@kyverno/backstage-plugin-policy-reporter-common';

type EntityCustomPoliciesContentProps = {
  annotationsDocumentationUrl?: string;
  policyDocumentationUrl?: string;
  sources: string[];
  title: string;
};

export const EntityCustomPoliciesContent = ({
  annotationsDocumentationUrl,
  policyDocumentationUrl,
  sources,
  title,
}: EntityCustomPoliciesContentProps) => {
  const { entity } = useEntity();
  const annotations = entity.metadata.annotations;

  const namespaces = getNamespaces(annotations);
  const kinds = getKinds(annotations);
  const resourceName = getResourceName(annotations);

  const annotationsState = isPolicyReporterAvailable(entity);

  useFilterParams({ namespaces, kinds, sources });

  const {
    environments,
    environmentsLoading,
    setCurrentEnvironment,
    currentEnvironment,
  } = useEntityEnvironment(entity, annotationsState);

  const [searchParams, setSearchParams] = useSearchParams();

  // Set the default search param to resourceName on mount
  useEffect(() => {
    if (resourceName && !searchParams.has('search')) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set('search', resourceName);
      setSearchParams(newParams, { replace: true });
    }
  }, [resourceName, searchParams, setSearchParams]);

  // Annotations missing
  if (!annotationsState)
    return (
      <Container>
        <Content>
          <MissingAnnotationEmptyState
            readMoreUrl={annotationsDocumentationUrl}
            annotation={KYVERNO_RESOURCE_NAME_ANNOTATION}
          />
        </Content>
      </Container>
    );

  // Fetching environments
  if (environmentsLoading) return <Progress />;

  // Environments missing
  if (environments === undefined || !currentEnvironment)
    return (
      <Container>
        <Content>
          <MissingEnvironmentsEmptyState entity={entity} />
        </Content>
      </Container>
    );

  return (
    <Container>
      <HeaderPage
        title={title}
        customActions={
          <SelectEnvironment
            environments={environments}
            initialEnvironment={currentEnvironment}
            setCurrentEnvironment={setCurrentEnvironment}
          />
        }
      />
      <Content>
        <Grid.Root columns="1" gap="4">
          <PolicyReportsTable
            currentEnvironment={currentEnvironment}
            emptyContentText="No policies"
            policyDocumentationUrl={policyDocumentationUrl}
          />
        </Grid.Root>
      </Content>
    </Container>
  );
};
