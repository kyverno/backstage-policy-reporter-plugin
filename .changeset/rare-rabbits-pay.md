---
'@kyverno/backstage-plugin-policy-reporter-backend': minor
---

Add support for configuring requestHeaders for the Policy Reporter Backend in your config using policyReporter.requestHeaders. This can be used for configuring Basic Auth credentials to the backend.

```yaml
policyReporter:
  requestHeaders:
    Authorization: Bearer ${POLICY_REPORTER_API_TOKEN}
```
