import React from 'react';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import { Environment } from '../EntityKyvernoPolicyReportsContent/EntityKyvernoPolicyReportsContent';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  formControl: {
    margin: 8,
    minWidth: 150,
  },
  hideDropdownArrow: {
    '& .MuiSelect-icon-196.Mui-disabled': {
      display: 'none',
    },
  },
});

type SelectEnvironmentProps = {
  environments: Environment[];
  currentEnvironment: Environment;
  setCurrentEnvironment: (environment: Environment) => void;
};

export const SelectEnvironment = ({
  environments,
  currentEnvironment,
  setCurrentEnvironment,
}: SelectEnvironmentProps) => {
  const classes = useStyles();

  const handleChange = (event: any) => {
    setCurrentEnvironment(environments[Number(event.target.value)]);
  };

  // Check if there is more then 1 environment
  const isSingleEnvironment = environments.length === 1;

  return (
    <FormControl className={classes.formControl}>
      <InputLabel id="select-environment-label">Environment</InputLabel>
      <Select
        labelId="select-environment-label"
        id="select-environment"
        value={String(currentEnvironment.id)}
        onChange={handleChange}
        disabled={isSingleEnvironment}
        className={isSingleEnvironment ? classes.hideDropdownArrow : ''}
      >
        {environments.map(env => (
          <MenuItem key={env.name} value={env.id}>
            {env.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
