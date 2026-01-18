import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import { makeStyles } from '@material-ui/core/styles';
import { Checkbox, ListItemText } from '@material-ui/core';

const useStyles = makeStyles({
  formControl: {
    margin: 8,
    minWidth: 150,
  },
});

export type SelectNamespaceProps = {
  currentNamespaces: string[];
  setNamespaces: (namespaces: string[]) => void;
  availableNamespaces: string[];
};

export const SelectNamespace = ({
  currentNamespaces,
  setNamespaces,
  availableNamespaces,
}: SelectNamespaceProps) => {
  const classes = useStyles();

  const handleChange = (event: any) => {
    setNamespaces(event.target.value);
  };

  return (
    <FormControl className={classes.formControl}>
      <InputLabel id="select-namespace-label" shrink>
        Namespaces
      </InputLabel>
      <Select
        labelId="select-namespace-label"
        id="select-namespace"
        multiple
        displayEmpty
        value={currentNamespaces}
        renderValue={selected => {
          if ((selected as string[]).length === 0) {
            return 'All';
          }

          return (selected as string[]).join(', ');
        }}
        onChange={handleChange}
      >
        {availableNamespaces.map(namespace => (
          <MenuItem key={namespace} value={namespace}>
            <Checkbox checked={currentNamespaces.includes(namespace)} />
            <ListItemText primary={namespace} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
