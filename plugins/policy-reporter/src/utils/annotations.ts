import {
  KYVERNO_KIND_ANNOTATION,
  KYVERNO_NAMESPACE_ANNOTATION,
  KYVERNO_RESOURCE_NAME_ANNOTATION,
} from 'backstage-plugin-policy-reporter-common';

// Define all annotations required for the component to work
export const annotationsRequired: string[] = [
  KYVERNO_RESOURCE_NAME_ANNOTATION,
  KYVERNO_KIND_ANNOTATION,
  KYVERNO_NAMESPACE_ANNOTATION,
];

// Check annotations object for all required annotations
export const containsRequiredAnnotations = (
  annotations: Record<string, string> | undefined,
): boolean => {
  return annotations
    ? annotationsRequired.every(key => key in annotations)
    : false;
};
