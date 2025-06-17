import {
  Content,
  ContentHeader,
  Header,
  Page,
  Progress,
} from '@backstage/core-components';
import { useEnvironments } from '../../hooks/useEnvironments';
import { SelectEnvironment } from '../SelectEnvironment';
import { Grid } from '@material-ui/core';
import { PolicyReportsTable } from '../PolicyReportsTable';
import { useState } from 'react';
import { Status } from '@kyverno/backstage-plugin-policy-reporter-common';
import { SelectStatus } from '../SelectStatus';

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

  // Fetching environments
  if (environmentsLoading) return <Progress />;

  // Environments missing
  if (environments === undefined || !currentEnvironment) return null; // TODO: display missing kubernetes environments

  return (
    <Page themeId="tool">
      <Header title={title} subtitle={subtitle} />
      <Content>
        <ContentHeader>
          <SelectStatus currentStatus={status} setStatus={setStatus} />
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
