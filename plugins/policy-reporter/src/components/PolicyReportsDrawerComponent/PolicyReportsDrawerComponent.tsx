import { ListResult } from '@kyverno/backstage-plugin-policy-reporter-common';
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Divider,
  Grid,
  Box,
  Paper,
  makeStyles,
  GridProps,
} from '@material-ui/core';
import { SeverityComponent } from '../SeverityComponent';
import { StatusComponent } from '../StatusComponent';

interface PolicyReportsDrawerProps {
  content: ListResult | undefined;
}

// Material-UI styles
const useStyles = makeStyles(theme => ({
  root: {
    marginBottom: theme.spacing(2),
    maxWidth: 800,
  },
  sectionTitle: {
    marginBottom: theme.spacing(1),
    fontWeight: 500,
  },
  propertyLabel: {
    color: theme.palette.text.secondary,
    fontWeight: 500,
  },
  propertyValue: {
    textAlign: 'right',
  },
  propertyContainer: {
    marginBottom: theme.spacing(1),
    display: 'flex',
    justifyContent: 'space-between',
  },
  divider: {
    margin: theme.spacing(2, 0),
  },
  message: {
    padding: theme.spacing(2),
    backgroundColor: theme.palette.grey[50],
    borderRadius: theme.shape.borderRadius,
    color: 'black',
  },
  propertiesContainer: {
    padding: theme.spacing(2),
    backgroundColor: theme.palette.grey[50],
    borderRadius: theme.shape.borderRadius,
  },
  propertyItem: {
    display: 'flex',
    justifyContent: 'space-between',
    borderBottom: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(1, 0),
    '&:last-child': {
      borderBottom: 'none',
    },
  },
}));

interface GridItemProps extends GridProps {
  label: string;
  value: string | React.ReactNode;
}

const GridItem = ({ label, value, ...gridProps }: GridItemProps) => {
  const classes = useStyles();
  const isString = typeof value === 'string';

  return (
    <Grid item {...gridProps}>
      <Box className={classes.propertyContainer}>
        <Typography variant="body2" className={classes.propertyLabel}>
          {label}
        </Typography>
        <Typography
          variant="body2"
          className={classes.propertyValue}
          component={isString ? 'p' : 'div'}
        >
          {value}
        </Typography>
      </Box>
    </Grid>
  );
};

export const PolicyReportsDrawerComponent = ({
  content,
}: PolicyReportsDrawerProps) => {
  const classes = useStyles();

  if (!content) {
    return (
      <Paper className={classes.root}>
        <Box p={2}>
          <Typography variant="body1" color="textSecondary">
            No policy information available
          </Typography>
        </Box>
      </Paper>
    );
  }

  // Format timestamp to readable date
  const formattedDate = new Date(content.timestamp * 1000).toLocaleString();

  return (
    <Card className={classes.root} data-testid="policy-reports-drawer">
      <CardHeader title="Policy Details" />
      <CardContent>
        {/* General Information */}
        <Typography variant="h6" className={classes.sectionTitle}>
          General Information
        </Typography>
        <Grid container spacing={2}>
          {[
            { label: 'ID', value: content.id },
            { label: 'Name', value: content.name },
            { label: 'Namespace', value: content.namespace },
            { label: 'Kind', value: content.kind },
            { label: 'Resource ID', value: content.resourceId },
            { label: 'Timestamp', value: formattedDate },
          ].map(({ label, value }, index) => (
            <GridItem label={label} key={index} value={value} xs={12} md={6} />
          ))}
        </Grid>

        <Divider className={classes.divider} />

        {/* Status Information */}
        <Typography variant="h6" className={classes.sectionTitle}>
          Status Information
        </Typography>
        <Grid container spacing={2}>
          <GridItem
            label="Status"
            value={<StatusComponent status={content.status} />}
            xs={12}
            md={6}
          />
          <GridItem
            label="Severity"
            value={<SeverityComponent severity={content.severity} />}
            xs={12}
            md={6}
          />
        </Grid>

        <Divider className={classes.divider} />

        {/* Policy Information */}
        <Typography variant="h6" className={classes.sectionTitle}>
          Policy Information
        </Typography>
        <Grid container spacing={2}>
          <GridItem label="Policy" value={content.policy} xs={12} />
          <GridItem label="Rule" value={content.rule} xs={12} />
        </Grid>

        <Divider className={classes.divider} />

        {/* Message */}
        <Typography variant="h6" className={classes.sectionTitle}>
          Message
        </Typography>
        <Paper elevation={0} className={classes.message}>
          <Typography variant="body2">{content.message}</Typography>
        </Paper>

        {/* Additional Properties */}
        {content.properties && Object.keys(content.properties).length > 0 && (
          <>
            <Divider className={classes.divider} />
            <Typography variant="h6" className={classes.sectionTitle}>
              Additional Properties
            </Typography>
            <Paper elevation={0} className={classes.propertiesContainer}>
              {Object.entries(content.properties).map(([key, value]) => (
                <Box key={key} className={classes.propertyItem}>
                  <Typography variant="body2" className={classes.propertyLabel}>
                    {key}
                  </Typography>
                  <Typography variant="body2">{value}</Typography>
                </Box>
              ))}
            </Paper>
          </>
        )}
      </CardContent>
    </Card>
  );
};
