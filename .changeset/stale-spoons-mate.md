---
'@kyverno/backstage-plugin-policy-reporter': minor
---

Add initial implemenation for the `PolicyReportsPage` component that can be used for a more global overview of all policy reports for a given kubernetes cluster.

Existing Entity components previously included a search bar on all tables, but it only supported searching within the already displayed policy reports. This version removes the search bar to avoid confusion and improve clarity.
