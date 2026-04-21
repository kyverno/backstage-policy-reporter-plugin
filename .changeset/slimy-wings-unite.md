---
'@kyverno/backstage-plugin-policy-reporter': minor
---

Entity content pages (`EntityKyvernoPoliciesContent`, `EntityCustomPoliciesContent`) now display a single unified table instead of separate tables for failing/passing/skipped policies, aligning with the `PolicyReportsPage`.

Search state is now managed via URL query params, making search results shareable and persistent across page refreshes.

Migrated table component to the new Backstage UI (BUI) components.
