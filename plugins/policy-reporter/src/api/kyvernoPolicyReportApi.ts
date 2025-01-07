import { createApiRef } from '@backstage/core-plugin-api';
import {
  Filter,
  Pagination,
  ResultList,
} from 'backstage-plugin-policy-reporter-common';

export const kyvernoPolicyReportApiRef = createApiRef<KyvernoPolicyReportApi>({
  id: 'plugin.kyvernopolicyreports.service',
});

export type KyvernoPolicyReportApi = {
  namespacedResults: (
    environment: string,
    filter?: Filter,
    pagination?: Pagination,
  ) => Promise<ResultList>;
};
