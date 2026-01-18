import {
  Content,
  ContentHeader,
  EmptyState,
  Header,
  Link,
  Page,
  Progress,
} from '@backstage/core-components';
import { useEnvironments } from '../../hooks/useEnvironments';
import { SelectEnvironment } from '../SelectEnvironment';
import { Button, Grid } from '@material-ui/core';
import { PolicyReportsTable } from '../PolicyReportsTable';
import { useState } from 'react';
import {
  Severity,
  Status,
} from '@kyverno/backstage-plugin-policy-reporter-common';
import { SelectStatus } from '../SelectStatus';
import { SelectSeverity } from '../SelectSeverity';
import { SelectNamespace } from '../SelectNamespace';
import { useNamespaces } from '../../hooks/useNamespaces';

export interface PolicyReportsPageProps {
  title?: string;
  policyDocumentationUrl?: string;
  subtitle?: string;
}

export const PolicyReportsPage = ({
  title = 'Policy Reports',
  subtitle = 'View all policy reports from a Kubernetes cluster',
  policyDocumentationUrl,
}: PolicyReportsPageProps) => {
  const {
    environments,
    environmentsLoading,
    setCurrentEnvironment,
    currentEnvironment,
  } = useEnvironments();

  const [status, setStatus] = useState<Status[]>(['fail']);
  const [severity, setSeverity] = useState<Severity[]>([]);
  const [selectedNamespaces, setSelectedNamespaces] = useState<string[]>([]);
  const { namespaces: availableNamespaces } = useNamespaces(currentEnvironment);

  // Fetching environments
  if (environmentsLoading) return <Progress />;

  // Environments missing
  if (environments === undefined || !currentEnvironment)
    return (
      <Page themeId="tool">
        <Header title={title} subtitle={subtitle} />
        <Content>
          <EmptyState
            missing="content"
            title="No kubernetes-cluster Resources found"
            description={
              <>
                You need to define a Resource with the kubernetes-cluster type
                and a<code> kyverno.io/endpoint </code> annotation for this
                plugin to work.
              </>
            }
            action={
              <>
                <Button
                  color="primary"
                  component={Link}
                  to="https://github.com/kyverno/backstage-policy-reporter-plugin"
                >
                  Read More
                </Button>
              </>
            }
          />
        </Content>
      </Page>
    );

  return (
    <Page themeId="tool">
      <Header title={title} subtitle={subtitle} />
      <Content>
        <ContentHeader>
          <SelectStatus currentStatus={status} setStatus={setStatus} />
          <SelectSeverity
            currentSeverity={severity}
            setSeverity={setSeverity}
          />
          <SelectNamespace
            currentNamespaces={selectedNamespaces}
            setNamespaces={setSelectedNamespaces}
            availableNamespaces={availableNamespaces}
          />
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
                status: status,
                severities: severity,
                namespaces: selectedNamespaces,
              }}
              title="Policy Results"
              emptyContentText="No policies found"
              policyDocumentationUrl={policyDocumentationUrl}
              pagination={{ offset: 25 }}
            />
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
};
