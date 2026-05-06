import { Badge } from '@backstage/ui';
import { Severity } from '@kyverno/backstage-plugin-policy-reporter-common';

type SeverityComponentProps = {
  severity: Severity | null;
};

const severityStyles: Record<string, React.CSSProperties> = {
  high: { backgroundColor: 'var(--bui-bg-danger)' },
  critical: { backgroundColor: 'var(--bui-bg-danger)' },
  medium: { backgroundColor: 'var(--bui-bg-warning)' },
  low: { backgroundColor: 'var(--bui-bg-success)' },
  info: { backgroundColor: 'var(--bui-bg-info)' },
  unknown: {},
};

export const SeverityComponent = ({ severity }: SeverityComponentProps) => {
  if (!severity) return null;
  return <Badge style={severityStyles[severity]}>{severity}</Badge>;
};
