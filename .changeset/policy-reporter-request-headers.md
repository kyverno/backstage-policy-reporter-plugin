---
'@kyverno/backstage-plugin-policy-reporter-backend': minor
---

Add `policyReporter.requestHeaders` config — a string→string map of HTTP headers injected into every outbound Policy Reporter API request, so the backend can authenticate through a gateway/proxy (auth headers, X-Scope-OrgID, etc.) without forking. Values support config substitution. No behaviour change when unset.
