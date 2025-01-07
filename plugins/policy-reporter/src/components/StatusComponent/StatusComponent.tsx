import React from 'react';
import {
  StatusAborted,
  StatusError,
  StatusOK,
  StatusWarning,
} from '@backstage/core-components';
import type { Status } from 'backstage-plugin-policy-reporter-common';

type StatusComponentProps = {
  status: Status;
};

export const StatusComponent = ({ status }: StatusComponentProps) => {
  switch (status) {
    case 'pass':
      return <StatusOK>PASS</StatusOK>;
    case 'error':
      return <StatusError>ERROR</StatusError>;
    case 'fail':
      return <StatusError>FAIL</StatusError>;
    case 'skip':
      return <StatusAborted>SKIP</StatusAborted>;
    case 'warn':
      return <StatusWarning>WARN</StatusWarning>;
    default:
      return null;
  }
};
