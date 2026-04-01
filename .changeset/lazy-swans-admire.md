---
'@kyverno/backstage-plugin-policy-reporter': minor
---

Migrated several components to the new Backstage UI (BUI) components, replacing legacy MUI-based implementations:

- `PolicyReportsPage`, `EntityKyvernoPoliciesContent`, and `EntityCustomPoliciesContent` now use BUI `Grid`, `Container`, and `HeaderPage` for layout.
- Filter selectors (`SelectEnvironment`, `SelectNamespace`, `SelectSeverity`, `SelectStatus`) now use the BUI `Select` component.
- Severity badges now use the BUI `Tag` and `TagGroup` components instead of MUI chips.
