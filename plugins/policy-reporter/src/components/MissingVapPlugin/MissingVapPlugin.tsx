import { EmptyState } from '@backstage/core-components';
import { ButtonLink } from '@backstage/ui';
import { KYVERNO_PLUGIN_VAP_ENDPOINT_ANNOTATION } from '@kyverno/backstage-plugin-policy-reporter-common';

export const MissingVapPlugin = () => (
  <EmptyState
    missing="content"
    title="No kubernetes-cluster Resources with the VAP plugin found"
    description={
      <>
        You need to define a Resource with the kubernetes-cluster type and a
        <code> {KYVERNO_PLUGIN_VAP_ENDPOINT_ANNOTATION} </code> annotation
        pointing to the Policy Reporter VAP plugin API to list Validating
        Admission Policies.
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
