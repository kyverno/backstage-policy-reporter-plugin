import { IdentifiedOption, Select, useAsyncList } from '@backstage/ui';
import { Key, useEffect, useMemo, useRef } from 'react';
import { usePolicyReportsFilters } from '../../hooks/usePolicyReportsFilters';
import { policyReporterApiRef } from '../../api';
import { toastApiRef, useApi } from '@backstage/frontend-plugin-api';
import { RequestError } from '@kyverno/backstage-plugin-policy-reporter-common';

export const SelectPolicy = () => {
  const { filter, updateFilter, environment } = usePolicyReportsFilters();
  const api = useApi(policyReporterApiRef);
  const toast = useApi(toastApiRef);

  const policyOptions = useAsyncList<IdentifiedOption>({
    async load({}) {
      if (!environment) return { items: [] };
      const response = await api.getPolicies({ query: { environment } });
      const result = await response.json();

      if (!response.ok) {
        toast.post({
          title: 'Failed to fetch policies',
          description:
            (result as unknown as RequestError).error ??
            response.statusText ??
            `Request failed with status ${response.status}`,
          status: 'danger',
        });
        return { items: [] };
      }

      return {
        items: result.map(s => ({ id: s, label: s })),
      };
    },
  });

  const policies = useMemo(() => {
    if (policyOptions.isLoading || policyOptions.items.length === 0) {
      return undefined;
    }

    return new Set(policyOptions.items.map(s => s.label));
  }, [policyOptions.items, policyOptions.isLoading]);

  // useRef to avoid dependency on the useAsyncList result
  const policyRef = useRef(policyOptions);
  policyRef.current = policyOptions;

  // Fetch policies again after changes to the environment
  useEffect(() => {
    policyRef.current.reload();
  }, [environment]);

  const selectedPolicies = filter.policies ?? [];

  // Keep a ref so the effect can read the latest selection without making it
  // a dependency — the effect should only trigger when available policies change.
  const selectedPoliciesRef = useRef(selectedPolicies);
  selectedPoliciesRef.current = selectedPolicies;

  useEffect(() => {
    if (!policies) return;
    const selected = selectedPoliciesRef.current;

    if (selected.every(policy => policies.has(policy))) return;

    updateFilter({
      policies: selected.filter(policy => policies.has(policy)),
    });
  }, [policies, updateFilter]);

  const handleChange = (key: Key | Key[] | null) => {
    if (!policies) return;

    if (key === null) {
      updateFilter({ policies: [] });
      return;
    }

    if (!Array.isArray(key)) {
      updateFilter({
        policies: policies.has(key as string) ? [key as string] : [],
      });
      return;
    }

    const filtered = key.filter((item): item is string =>
      policies.has(item as string),
    );
    updateFilter({ policies: filtered });
  };

  return (
    <Select
      label="Policy"
      selectionMode="multiple"
      options={policyOptions}
      value={selectedPolicies}
      onChange={handleChange}
      placeholder="All"
    />
  );
};
