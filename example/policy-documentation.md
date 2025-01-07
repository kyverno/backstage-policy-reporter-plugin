# Kyverno Policy Documentation

This document provides descriptions of policies and steps on how to fix violations reported by Kyverno scans.

## disallow-default-namespace

<!-- Header name should match the exact policy name -->

<!-- Example structure for how it could look like -->

**Policy Description:**
Kubernetes Namespaces are an optional feature that provide a way to segment and isolate cluster resources across multiple applications and users. As a best practice, workloads should be isolated with Namespaces. Namespaces should be required and the default (empty) Namespace should not be used. This policy validates that Pods specify a Namespace name other than default.

**How to Fix:**
Ensure that all Pods specify a Namespace name other than default.

<!-- Continue to add policies below following the same structure -->
