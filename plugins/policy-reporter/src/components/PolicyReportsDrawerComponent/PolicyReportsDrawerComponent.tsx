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
          <Grid item xs={12} md={6}>
            <Box className={classes.propertyContainer}>
              <Typography variant="body2" className={classes.propertyLabel}>
                ID
              </Typography>
              <Typography variant="body2" className={classes.propertyValue}>
                {content.id}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box className={classes.propertyContainer}>
              <Typography variant="body2" className={classes.propertyLabel}>
                Name
              </Typography>
              <Typography variant="body2" className={classes.propertyValue}>
                {content.name}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box className={classes.propertyContainer}>
              <Typography variant="body2" className={classes.propertyLabel}>
                Namespace
              </Typography>
              <Typography variant="body2" className={classes.propertyValue}>
                {content.namespace}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box className={classes.propertyContainer}>
              <Typography variant="body2" className={classes.propertyLabel}>
                Kind
              </Typography>
              <Typography variant="body2" className={classes.propertyValue}>
                {content.kind}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box className={classes.propertyContainer}>
              <Typography variant="body2" className={classes.propertyLabel}>
                Resource ID
              </Typography>
              <Typography variant="body2" className={classes.propertyValue}>
                {content.resourceId}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box className={classes.propertyContainer}>
              <Typography variant="body2" className={classes.propertyLabel}>
                Timestamp
              </Typography>
              <Typography variant="body2" className={classes.propertyValue}>
                {formattedDate}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider className={classes.divider} />

        {/* Status Information */}
        <Typography variant="h6" className={classes.sectionTitle}>
          Status Information
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box className={classes.propertyContainer}>
              <Typography variant="body2" className={classes.propertyLabel}>
                Status
              </Typography>
              <StatusComponent status={content.status} />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box className={classes.propertyContainer}>
              <Typography variant="body2" className={classes.propertyLabel}>
                Severity
              </Typography>
              <SeverityComponent severity={content.severity} />
            </Box>
          </Grid>
        </Grid>

        <Divider className={classes.divider} />

        {/* Policy Information */}
        <Typography variant="h6" className={classes.sectionTitle}>
          Policy Information
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box className={classes.propertyContainer}>
              <Typography variant="body2" className={classes.propertyLabel}>
                Policy
              </Typography>
              <Typography variant="body2" className={classes.propertyValue}>
                {content.policy}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box className={classes.propertyContainer}>
              <Typography variant="body2" className={classes.propertyLabel}>
                Rule
              </Typography>
              <Typography variant="body2" className={classes.propertyValue}>
                {content.rule}
              </Typography>
            </Box>
          </Grid>
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
