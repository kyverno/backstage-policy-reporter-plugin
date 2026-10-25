---
'@kyverno/backstage-plugin-policy-reporter': minor
'@kyverno/backstage-plugin-policy-reporter-backend': minor
'@kyverno/backstage-plugin-policy-reporter-common': minor
---

Add support for the Policy Reporter ValidatingAdmissionPolicy (VAP) plugin. Clusters annotated with `kyverno.io/plugin-vap-endpoint` expose their policies through the new `GET /plugins/vap/v1/policies` backend route. Outbound requests to the VAP plugin use the dedicated `policyReporter.plugins.vap.requestHeaders` configuration. The new frontend system adds a "Validating Admission Policies" sub-page to the Policy Reporter page, disabled by default. Enable it with the `sub-page:policy-reporter/validating-admission-policies` extension.
