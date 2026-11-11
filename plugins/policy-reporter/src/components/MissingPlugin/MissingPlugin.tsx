import { EmptyState } from '@backstage/core-components';
import { ButtonLink } from '@backstage/ui';

type MissingPluginProps = {
  /** The plugin's name as the copy reads it, such as `VAP` or `Trivy`. */
  plugin: string;
  /** The endpoint annotation a cluster needs for that plugin. */
  annotation: string;
};

/**
 * Shown when no cluster carries the annotation a Policy Reporter plugin
 * sub-page needs. Parameterised rather than copied per plugin: the two plugins
 * differ by a name and an annotation, and a third copy would arrive with the
 * Kyverno plugin.
 */
export const MissingPlugin = ({ plugin, annotation }: MissingPluginProps) => (
  <EmptyState
    missing="content"
    title={`No kubernetes-cluster Resources with the ${plugin} plugin found`}
    description={
      <>
        You need to define a Resource with the kubernetes-cluster type and a
        <code> {annotation} </code> annotation pointing to the Policy Reporter{' '}
        {plugin} plugin API.
      </>
    }
    action={
      <ButtonLink
        target="_blank"
        href="https://github.com/kyverno/backstage-policy-reporter-plugin"
      >
        Read More
      </ButtonLink>
    }
  />
);
