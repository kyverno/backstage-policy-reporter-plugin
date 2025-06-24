import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import { Status } from '@kyverno/backstage-plugin-policy-reporter-common';
import { makeStyles } from '@material-ui/core/styles';
import { Checkbox, ListItemText } from '@material-ui/core';

// This could be moved into the common package if needed in multiple places
const STATUS_VALUES: Status[] = [
  'fail',
  'skip',
  'pass',
  'warn',
  'error',
  'summary',
];

const useStyles = makeStyles({
  formControl: {
    margin: 8,
    minWidth: 150,
  },
});

export type SelectStatusProps = {
  currentStatus: Status[];
  setStatus: (Status: Status[]) => void;
};

export const SelectStatus = ({
  currentStatus,
  setStatus,
}: SelectStatusProps) => {
  const classes = useStyles();

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setStatus(event.target.value as Status[]);
  };

  return (
    <FormControl className={classes.formControl}>
      <InputLabel id="select-status-label" shrink>
        Status
      </InputLabel>
      <Select
        labelId="select-status-label"
        id="select-status"
        multiple
        displayEmpty
        value={currentStatus}
        renderValue={selected => {
          if ((selected as Status[]).length === 0) {
            return 'All';
          }

          return (selected as Status[]).join(', ');
        }}
        onChange={handleChange}
      >
        {STATUS_VALUES.map(status => (
          <MenuItem key={status} value={status}>
            <Checkbox checked={currentStatus.includes(status)} />
            <ListItemText primary={status} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
