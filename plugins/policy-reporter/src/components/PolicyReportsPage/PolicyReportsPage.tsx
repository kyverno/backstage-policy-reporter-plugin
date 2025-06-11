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

export const PolicyReportsPage = ({}) => {
  const {
    environments,
    environmentsLoading,
    setCurrentEnvironment,
    currentEnvironment,
  } = useEnvironments();

  // Fetching environments
  if (environmentsLoading) return <Progress />;

  // Environments missing
  if (environments === undefined || !currentEnvironment) return undefined; // TODO: display missing kubernetes environments

  return (
    <Page themeId="tool">
      <Header title="Policy Reports" subtitle="View all policy reports" />
      <Content>
        <ContentHeader>
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
                status: ['fail', 'warn', 'error'],
              }}
              title="Failing Policy Results"
              emptyContentText="No failing policies"
            />
          </Grid>
          <Grid item xs={12}>
            <PolicyReportsTable
              currentEnvironment={currentEnvironment}
              filter={{
                status: ['pass'],
              }}
              title="Passing Policy Results"
              emptyContentText="No passing policies"
            />
          </Grid>
          <Grid item xs={12}>
            <PolicyReportsTable
              currentEnvironment={currentEnvironment}
              filter={{
                status: ['skip'],
              }}
              title="Skipped Policy Results"
              emptyContentText="No skipped policies"
            />
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
};
