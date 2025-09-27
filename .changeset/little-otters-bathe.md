---
'@kyverno/backstage-plugin-policy-reporter-common': minor
'@kyverno/backstage-plugin-policy-reporter': minor
---

Add support for the `backstage.io/kubernetes-namespace` annotation as an alternative for the `kyverno.io/namespace`. This is useful for anyone already using the Kubernetes plugin. The kyverno namespaced annotation will always be the first priority.

Add `isPolicyReporterAvailable` helper function to validate if PolicyReporter is configured for an entity.
