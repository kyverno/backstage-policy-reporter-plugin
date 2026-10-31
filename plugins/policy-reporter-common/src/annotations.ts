// The resource to display policies
export const KYVERNO_RESOURCE_NAME_ANNOTATION = 'kyverno.io/resource-name';

// The kind of the resource to display policies
export const KYVERNO_KIND_ANNOTATION = 'kyverno.io/kind';

// The namespace of the resource to display policies
export const KYVERNO_NAMESPACE_ANNOTATION = 'kyverno.io/namespace';

// The namespace of the resource to display policies
export const KUBERNETES_NAMESPACE_ANNOTATION =
  'backstage.io/kubernetes-namespace';

// The endpoint for the Policy Reporter API
// EXAMPLE: https://kyverno.io/policy-reporter/api/
export const KYVERNO_ENDPOINT_ANNOTATION = 'kyverno.io/endpoint';

// The endpoint for the Policy Reporter ValidatingAdmissionPolicy (VAP) plugin API
// EXAMPLE: http://policy-reporter-vap.policy-reporter:8080/
export const KYVERNO_PLUGIN_VAP_ENDPOINT_ANNOTATION =
  'kyverno.io/plugin-vap-endpoint';

// The endpoint for the Policy Reporter Trivy plugin API
// EXAMPLE: http://policy-reporter-trivy.policy-reporter:8080/
export const KYVERNO_PLUGIN_TRIVY_ENDPOINT_ANNOTATION =
  'kyverno.io/plugin-trivy-endpoint';
