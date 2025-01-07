import React from 'react';
import Chip from '@material-ui/core/Chip';
import { Severity } from 'backstage-plugin-policy-reporter-common';
import makeStyles from '@material-ui/core/styles/makeStyles';

const useStyles = makeStyles((theme: any) => ({
  error: {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
  },
  success: {
    backgroundColor: theme.palette.success.main,
    color: theme.palette.success.contrastText,
  },
  warning: {
    backgroundColor: theme.palette.warning.main,
    color: theme.palette.warning.contrastText,
  },
  info: {
    backgroundColor: theme.palette.info.main,
    color: theme.palette.info.contrastText,
  },
}));

type SeverityComponentProps = {
  severity: Severity | null;
};

export const SeverityComponent = ({ severity }: SeverityComponentProps) => {
  const classes = useStyles();
  switch (severity) {
    case 'high':
      return <Chip label={severity} className={classes.error} />;
    case 'low':
      return <Chip label={severity} className={classes.success} />;
    case 'medium':
      return <Chip label={severity} className={classes.warning} />;
    case 'info':
      return <Chip label={severity} className={classes.info} />;
    case 'critical':
      return <Chip label={severity} className={classes.error} />;
    default:
      return null;
  }
};
