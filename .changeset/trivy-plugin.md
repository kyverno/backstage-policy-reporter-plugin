---
'@kyverno/backstage-plugin-policy-reporter-backend': minor
'@kyverno/backstage-plugin-policy-reporter-common': minor
---

Add support for the Policy Reporter Trivy plugin. Clusters annotated with `kyverno.io/plugin-trivy-endpoint` expose their vulnerabilities through the new `GET /plugins/trivy/v1/policies` route, and outbound requests to the plugin use the `policyReporter.plugins.trivy.requestHeaders` configuration.
