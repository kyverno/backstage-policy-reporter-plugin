---
'@kyverno/backstage-plugin-policy-reporter': minor
---

NFS (/alpha): Add a new subpage for viewing vulnerabilities from the Policy Reporter Trivy plugin, sorted by severity. Only clusters annotated with `kyverno.io/plugin-trivy-endpoint` are listed on it. The subpage is disabled by default, enable it with the `sub-page:policy-reporter/trivy-vulnerabilities` extension.
