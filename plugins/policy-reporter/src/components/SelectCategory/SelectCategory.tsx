import { IdentifiedOption, Select, useAsyncList } from '@backstage/ui';
import { Key, useEffect, useMemo, useRef } from 'react';
import { usePolicyReportsFilters } from '../../hooks/usePolicyReportsFilters';
import { policyReporterApiRef } from '../../api';
import { toastApiRef, useApi } from '@backstage/frontend-plugin-api';
import { RequestError } from '@kyverno/backstage-plugin-policy-reporter-common';

export const SelectCategory = () => {
  const { filter, updateFilter, environment } = usePolicyReportsFilters();
  const api = useApi(policyReporterApiRef);
  const toast = useApi(toastApiRef);

  const categoryOptions = useAsyncList<IdentifiedOption>({
    async load({}) {
      if (!environment) return { items: [] };
      const response = await api.getCategories({ query: { environment } });
      const result = await response.json();

      if (!response.ok) {
        toast.post({
          title: 'Failed to fetch categories',
          description:
            (result as unknown as RequestError).error ||
            response.statusText ||
            `Request failed with status ${response.status}`,
          status: 'danger',
        });
        return { items: [] };
      }

      return {
        items: result.map(c => ({ id: c, label: c })),
      };
    },
  });

  const categories = useMemo(() => {
    if (categoryOptions.isLoading || categoryOptions.items.length === 0) {
      return undefined;
    }

    return new Set(categoryOptions.items.map(c => c.label));
  }, [categoryOptions.isLoading, categoryOptions.items]);

  // useRef to avoid dependency on the useAsyncList result
  const categoryRef = useRef(categoryOptions);
  categoryRef.current = categoryOptions;

  // Fetch sources again after changes to the environment
  useEffect(() => {
    categoryRef.current.reload();
  }, [environment]);

  const selectedCategories = filter.categories ?? [];

  // Keep a ref so the effect can read the latest selection without making it
  // a dependency — the effect should only trigger when available sources change.
  const selectedCategoriesRef = useRef(selectedCategories);
  selectedCategoriesRef.current = selectedCategories;

  useEffect(() => {
    if (!categories) return;

    const selected = selectedCategoriesRef.current;

    if (selected.every(category => categories.has(category))) return;

    updateFilter({
      categories: selected.filter(category => categories.has(category)),
    });
  }, [categories, updateFilter]);

  const handleChange = (key: Key | Key[] | null) => {
    if (key === null) {
      updateFilter({ categories: [] });
      return;
    }

    if (!categories) return;

    if (!Array.isArray(key)) {
      updateFilter({
        categories: categories.has(key as string) ? [key as string] : [],
      });
      return;
    }

    const filtered = key.filter((item): item is string =>
      categories.has(item as string),
    );
    updateFilter({ categories: filtered });
  };

  return (
    <Select
      label="Category"
      selectionMode="multiple"
      options={categoryOptions}
      value={selectedCategories}
      onChange={handleChange}
      placeholder="All"
    />
  );
};
