import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import { Severity } from '@kyverno/backstage-plugin-policy-reporter-common';
import { makeStyles } from '@material-ui/core/styles';
import { Checkbox, ListItemText } from '@material-ui/core';

// This could be moved into the common package if needed in multiple places
const SEVERITY_VALUES: Severity[] = [
  'unknown',
  'low',
  'medium',
  'high',
  'critical',
  'info',
];

const useStyles = makeStyles({
  formControl: {
    margin: 8,
    minWidth: 150,
  },
});

export type SelectSeverityProps = {
  currentSeverity: Severity[];
  setSeverity: (Status: Severity[]) => void;
};

export const SelectSeverity = ({
  currentSeverity: currentSeverity,
  setSeverity: setSeverity,
}: SelectSeverityProps) => {
  const classes = useStyles();

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSeverity(event.target.value as Severity[]);
  };

  return (
    <FormControl className={classes.formControl}>
      <InputLabel id="select-severity-label" shrink>
        Severity
      </InputLabel>
      <Select
        labelId="select-severity-label"
        id="select-severity"
        multiple
        displayEmpty
        value={currentSeverity}
        renderValue={selected => {
          if ((selected as Severity[]).length === 0) {
            return 'All';
          }

          return (selected as Severity[]).join(', ');
        }}
        onChange={handleChange}
      >
        {SEVERITY_VALUES.map(severity => (
          <MenuItem key={severity} value={severity}>
            <Checkbox checked={currentSeverity.includes(severity)} />
            <ListItemText primary={severity} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
