import {
  KYVERNO_PLUGIN_TRIVY_ENDPOINT_ANNOTATION,
  KYVERNO_PLUGIN_VAP_ENDPOINT_ANNOTATION,
} from '@kyverno/backstage-plugin-policy-reporter-common';
import { PluginDescriptor } from './pluginPolicyService';

// The Policy Reporter ValidatingAdmissionPolicy (VAP) plugin API
export const VAP_PLUGIN: PluginDescriptor = {
  annotation: KYVERNO_PLUGIN_VAP_ENDPOINT_ANNOTATION,
  configKey: 'policyReporter.plugins.vap.requestHeaders',
  displayName: 'Policy Reporter VAP plugin',
};

// The Policy Reporter Trivy plugin API
export const TRIVY_PLUGIN: PluginDescriptor = {
  annotation: KYVERNO_PLUGIN_TRIVY_ENDPOINT_ANNOTATION,
  configKey: 'policyReporter.plugins.trivy.requestHeaders',
  displayName: 'Policy Reporter Trivy plugin',
};
