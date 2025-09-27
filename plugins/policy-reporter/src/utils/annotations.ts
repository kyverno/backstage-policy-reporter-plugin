import { Entity } from '@backstage/catalog-model';
import {
  KYVERNO_KIND_ANNOTATION,
  KYVERNO_NAMESPACE_ANNOTATION,
  KYVERNO_RESOURCE_NAME_ANNOTATION,
  KUBERNETES_NAMESPACE_ANNOTATION,
} from '@kyverno/backstage-plugin-policy-reporter-common';

/**
 * Utility functions for working with Backstage entity annotations
 * specifically for Kyverno policy reporter plugin integration
 */

/**
 * Validates that an annotations object contains all required annotation keys
 * @param annotations - The annotations object from a Backstage entity (optional)
 * @param required - Array of required annotation keys to check for
 * @returns true if all required keys exist in annotations, false otherwise
 */
export const containsRequiredAnnotations = (
  annotations: Record<string, string> | undefined,
  required: string[],
): boolean => {
  return annotations ? required.every(key => key in annotations) : false;
};

/**
 * Validates that an entity has configured policy reporter
 * @param entity - The the Backstage entity
 * @returns true if policy reporter is configured.
 */
export const isPolicyReporterAvailable = (entity: Entity) =>
  Boolean(entity.metadata.annotations?.[KYVERNO_RESOURCE_NAME_ANNOTATION]);

/**
 * Extracts namespace values from annotations, supporting both Kyverno and Kubernetes formats
 * Priority: Kyverno namespace annotation (comma-separated) > Kubernetes namespace annotation (single value)
 * @param annotations - The annotations object from a Backstage entity (optional)
 * @returns Array of namespace strings, empty array if no namespace annotations found
 */
export const getNamespaces = (
  annotations: Record<string, string> | undefined,
): string[] => {
  if (!annotations) return [];

  // Check for Kyverno-specific namespace annotation (supports multiple namespaces)
  if (annotations[KYVERNO_NAMESPACE_ANNOTATION]) {
    return annotations[KYVERNO_NAMESPACE_ANNOTATION].split(',').map(item =>
      item.trim(),
    );
  }

  // Fall back to standard Kubernetes namespace annotation (single namespace)
  if (annotations[KUBERNETES_NAMESPACE_ANNOTATION]) {
    return [annotations[KUBERNETES_NAMESPACE_ANNOTATION]];
  }

  return [];
};

/**
 * Extracts Kubernetes resource kinds from Kyverno-specific annotation
 * @param annotations - The annotations object from a Backstage entity (optional)
 * @returns Array of Kubernetes resource kind strings (e.g., ['Pod', 'Service']), empty array if not found
 */
export const getKinds = (
  annotations: Record<string, string> | undefined,
): string[] => {
  if (!annotations) return [];

  // Parse comma-separated list of Kubernetes resource kinds
  if (annotations[KYVERNO_KIND_ANNOTATION]) {
    return annotations[KYVERNO_KIND_ANNOTATION].split(',').map(item =>
      item.trim(),
    );
  }

  return [];
};

/**
 * Extracts a specific resource name from Kyverno annotation
 * Used to target a particular Kubernetes resource for policy evaluation
 * @param annotations - The annotations object from a Backstage entity (optional)
 * @returns Resource name string, empty string if annotation not found
 */
export const getResourceName = (
  annotations: Record<string, string> | undefined,
): string => {
  if (!annotations) return '';

  return annotations[KYVERNO_RESOURCE_NAME_ANNOTATION] || '';
};
