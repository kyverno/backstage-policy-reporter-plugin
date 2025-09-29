---
'@kyverno/backstage-plugin-policy-reporter-backend': minor
'@kyverno/backstage-plugin-policy-reporter-common': minor
'@kyverno/backstage-plugin-policy-reporter': minor
---

Migrate to OpenAPI-generated ApiClient, typed Express router, and common types instead of manual definitions.

**BREAKING:** The backend endpoint now accepts environment entity as a query parameter instead of a path parameter.

Frontend and backend must be updated simultaneously to maintain compatibility.
