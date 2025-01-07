import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import React from 'react';
import { CodeSnippet, Link, EmptyState } from '@backstage/core-components';
import { Entity } from '@backstage/catalog-model';

const useStyles = makeStyles(
  theme => ({
    code: {
      borderRadius: 6,
      margin: theme.spacing(2, 0),
      background:
        theme.palette.type === 'dark' ? '#444' : theme.palette.common.white,
    },
  }),
  { name: 'BackstageMissingAnnotationEmptyState' },
);

function generateYamlExample(entity?: Entity): {
  yamlText: string;
  lineNumbers: number[];
} {
  const kind = entity?.kind || 'Component';
  const name = entity?.metadata.name || 'example';
  const type = entity?.spec?.type || 'website';
  const owner = entity?.spec?.owner || 'user:default/guest';

  const yamlText = `apiVersion: backstage.io/v1alpha1
kind: ${kind}
metadata:
  name: ${name}
spec:
  type: ${type}
  owner: ${owner}
  dependsOn: 
   - value`;

  const lineNumbers: number[] = [9];

  return {
    yamlText,
    lineNumbers,
  };
}

export const MissingEnvironmentsEmptyState = (props: {
  readMoreUrl?: string;
  entity?: Entity;
}) => {
  const { entity, readMoreUrl } = props;
  const url =
    readMoreUrl ||
    'https://backstage.io/docs/features/software-catalog/descriptor-format#specdependson-optional';

  const classes = useStyles();

  const entityKind = entity?.kind || 'Component';
  const { yamlText, lineNumbers } = generateYamlExample(entity);
  return (
    <EmptyState
      missing="field"
      title="Missing Valid Environment Dependency"
      description={
        <>
          You need to add a dependency to a kubernetes-cluster Resource with a
          kyverno.io/endpoint annotation defined if you want to use this plugin.
        </>
      }
      action={
        <>
          <Typography variant="body1">
            Add the resource dependency to your {entityKind} YAML as shown in
            the highlighted example below:
          </Typography>
          <Box className={classes.code}>
            <CodeSnippet
              text={yamlText}
              language="yaml"
              showLineNumbers
              highlightedNumbers={lineNumbers}
              customStyle={{ background: 'inherit', fontSize: '115%' }}
            />
          </Box>
          <Button color="primary" component={Link} to={url}>
            Read more
          </Button>
        </>
      }
    />
  );
};
