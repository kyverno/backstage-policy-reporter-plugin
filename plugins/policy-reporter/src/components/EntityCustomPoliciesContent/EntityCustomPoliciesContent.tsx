import { Content, Progress } from '@backstage/core-components';
import {
  MissingAnnotationEmptyState,
  useEntity,
} from '@backstage/plugin-catalog-react';
import { Container, Header } from '@backstage/ui';
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
import { SelectStatus } from '../SelectStatus';
import { SelectSeverity } from '../SelectSeverity';
import { FilterLayout } from '../FilterLayout';

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
        sources: sources,
        search: getResourceName(annotations),
      }}
      defaultEnvironment={environments[0].entityRef}
    >
      <Container>
        <Header
          title={title}
          customActions={<SelectEnvironment environments={environments} />}
        />
        <Content>
          <FilterLayout>
            <FilterLayout.Filters>
              <SelectStatus />
              <SelectSeverity />
            </FilterLayout.Filters>
            <FilterLayout.Content>
              <PolicyReportsTable
                emptyContentText="No policies"
                policyDocumentationUrl={policyDocumentationUrl}
              />
            </FilterLayout.Content>
          </FilterLayout>
        </Content>
      </Container>
    </PolicyReportsFiltersProvider>
  );
};
