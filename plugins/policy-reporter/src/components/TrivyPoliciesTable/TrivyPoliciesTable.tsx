import { useAsync } from 'react-use';
import {
  RequestError,
  Severity,
  PluginPolicy,
} from '@kyverno/backstage-plugin-policy-reporter-common';
import {
  Cell,
  CellText,
  ColumnConfig,
  Table,
  Text,
  useTable,
} from '@backstage/ui';
import { toastApiRef, useApi } from '@backstage/frontend-plugin-api';
import { policyReporterApiRef } from '../../api';
import { SeverityComponent } from '../SeverityComponent';
import { useEnvironment } from '../../hooks/useEnvironment';

type PluginPolicyRow = PluginPolicy & { id: string };

/**
 * Rank per severity, most severe first. Keyed by `Severity` rather than ordered
 * in an array, so a level added upstream fails to compile here instead of
 * silently sorting last.
 */
const SEVERITY_RANK: Record<Severity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
  info: 4,
  unknown: 5,
};

/** A vulnerability the scanner left unrated ranks with the unknown ones. */
const severityRank = (severity: string | undefined) =>
  SEVERITY_RANK[severity as Severity] ?? SEVERITY_RANK.unknown;

/**
 * Reduces a Markdown description to its opening paragraph as plain text.
 *
 * The paragraph is returned whole, not cut to a fixed length: `CellText` truncates it to the column width
 */
const summarize = (description: string | undefined = '') =>
  description
    .split(/\n{2,}/)
    // Headings are not prose, and the heading after a short opening
    // paragraph would otherwise run into the same line.
    .map(paragraph => paragraph.replace(/^#{1,6}\s+.*$/gm, '').trim())
    .find(paragraph => paragraph.length > 0)
    // Advisories name the affected package in backticks, which a plain-text
    // cell renders literally.
    ?.replace(/[`*]/g, '') ?? '';

export const TrivyPoliciesTable = () => {
  const policyReporterApi = useApi(policyReporterApiRef);
  const { environment } = useEnvironment();
  const toast = useApi(toastApiRef);

  const { value: policies, loading } = useAsync(async (): Promise<
    PluginPolicyRow[]
  > => {
    const response = await policyReporterApi.getTrivyPolicies({
      query: { environment: encodeURI(environment) },
    });

    const result = await response.json();

    if (!response.ok) {
      toast.post({
        title: 'Failed to fetch vulnerabilities',
        description:
          (result as unknown as RequestError).error ||
          response.statusText ||
          `Request failed with status ${response.status}`,
        status: 'danger',
      });
      return [];
    }

    return result.map(policy => ({ ...policy, id: policy.name }));
  }, [environment]);

  // Severity is the column a reader scans first, and the whole list arrives at
  // once, so the table sorts it client-side. Declared as the table's sort
  // rather than applied to the fetched array, so the header can be made
  // clickable later without moving the comparator.
  const { tableProps } = useTable({
    mode: 'complete',
    data: loading ? undefined : policies,
    initialSort: { column: 'severity', direction: 'descending' },
    sortFn: (data, sort) => {
      if (sort.column !== 'severity') return data;
      const direction = sort.direction === 'descending' ? 1 : -1;
      return [...data].sort(
        (a, b) =>
          direction * (severityRank(a.severity) - severityRank(b.severity)),
      );
    },
    paginationOptions: { pageSize: 20 },
  });

  const columns: ColumnConfig<PluginPolicyRow>[] = [
    {
      id: 'title',
      label: 'Title',
      isRowHeader: true,
      // A title is often the bare advisory id that `name` repeats, so the
      // second line is drawn only when it differs.
      cell: item => (
        <CellText
          title={item.title}
          description={item.name === item.title ? undefined : item.name}
        />
      ),
    },
    {
      id: 'severity',
      label: 'Severity',
      isSortable: true,
      // Cap the badge column so the summary gets the space
      maxWidth: 120,
      cell: item => (
        <Cell>
          <SeverityComponent
            severity={(item.severity as Severity | undefined) ?? null}
          />
        </Cell>
      ),
    },
    {
      id: 'description',
      label: 'Description',
      width: '2fr',
      cell: item => <CellText title={summarize(item.description)} />,
    },
  ];

  return (
    <Table
      emptyState={<Text>No vulnerabilities found</Text>}
      columnConfig={columns}
      {...tableProps}
    />
  );
};
