import { EmptyState } from '@backstage/core-components';
import { ButtonLink } from '@backstage/ui';

export const MissingKubernetesCluster = () => (
  <EmptyState
    missing="content"
    title="No kubernetes-cluster Resources found"
    description={
      <>
        You need to define a Resource with the kubernetes-cluster type and a
        <code> kyverno.io/endpoint </code> annotation for this plugin to work.
      </>
    }
    action={
      <>
        <ButtonLink
          target="_blank"
          href="https://github.com/kyverno/backstage-policy-reporter-plugin"
        >
          Read More
        </ButtonLink>
      </>
    }
  />
);
