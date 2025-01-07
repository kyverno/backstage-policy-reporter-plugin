export type Status = 'fail' | 'skip' | 'pass' | 'warn' | 'error' | 'summary';

export type Severity =
  | 'unknown'
  | 'info'
  | 'low'
  | 'medium'
  | 'high'
  | 'critical';

export type ResultList = { items: ListResult[]; count: number };

export type ListResult = {
  id: string;
  namespace: string;
  kind: string;
  name: string;
  resourceId: string;
  message: string;
  policy: string;
  rule: string;
  status: Status;
  severity: Severity;
  timestamp: number;
  properties: { [key: string]: string };
};

export type Filter = {
  kinds?: string[];
  clusterKinds?: string[];
  categories?: string[];
  namespaces?: string[];
  severities?: Severity[];
  policies?: string[];
  sources?: string[];
  exclude?: string[];
  labels?: string[];
  status?: Status[];
  search?: string;
  resource_id?: string;
  namespaced?: boolean;
};

export type Pagination = {
  page: number;
  offset: number;
  sortBy?: string[];
  direction?: Direction;
};

export enum Direction {
  ASC = 'asc',
  DESC = 'desc',
}
