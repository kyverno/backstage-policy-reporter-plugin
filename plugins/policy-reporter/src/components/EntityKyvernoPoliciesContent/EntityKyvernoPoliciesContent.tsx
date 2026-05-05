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
import { PolicyReportsFiltersProvider } from '../../hooks/usePolicyReportsFilters';
import { KYVERNO_RESOURCE_NAME_ANNOTATION } from '@kyverno/backstage-plugin-policy-reporter-common';

type KyvernoPoliciesContentProps = {
  annotationsDocumentationUrl?: string;
  policyDocumentationUrl?: string;
};

export const EntityKyvernoPoliciesContent = ({
  annotationsDocumentationUrl,
  policyDocumentationUrl,
}: KyvernoPoliciesContentProps) => {
  const { entity } = useEntity();
  const annotations = entity.metadata.annotations;

  const annotationsState = isPolicyReporterAvailable(entity);

  const { environments, environmentsLoading } = useEntityEnvironment(
    entity,
    annotationsState,
  );

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
  if (!environments?.length)
    return (
      <Container>
        <Content>
          <MissingEnvironmentsEmptyState entity={entity} />
        </Content>
      </Container>
    );

  return (
    <PolicyReportsFiltersProvider
      defaultFilters={{
        namespaces: getNamespaces(annotations),
        kinds: getKinds(annotations),
        sources: ['kyverno'],
        search: getResourceName(annotations),
      }}
      defaultEnvironment={environments[0].entityRef}
    >
      <Container>
        <HeaderPage
          title="Kyverno Policy Reports"
          customActions={<SelectEnvironment environments={environments} />}
        />
        <Content>
          <Grid.Root columns="1" gap="4">
            <PolicyReportsTable
              emptyContentText="No policies found"
              policyDocumentationUrl={policyDocumentationUrl}
            />
          </Grid.Root>
        </Content>
      </Container>
    </PolicyReportsFiltersProvider>
  );
};
