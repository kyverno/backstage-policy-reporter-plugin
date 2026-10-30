---
'@kyverno/backstage-plugin-policy-reporter-backend': minor
'@kyverno/backstage-plugin-policy-reporter-common': minor
---

Add support for the Policy Reporter Trivy plugin. Clusters annotated with `kyverno.io/plugin-trivy-endpoint` expose their vulnerabilities through the new `GET /plugins/trivy/v1/policies` backend route. Outbound requests to the Trivy plugin use the dedicated `policyReporter.plugins.trivy.requestHeaders` configuration. Internally the per-plugin backend services were replaced by one shared plugin service parameterised by a plugin descriptor. `createRouter` now takes a `trivyPluginService` alongside `vapPluginService`, both typed `PluginPolicyApi`, which is exported together with `PluginDescriptor` from the package root.
