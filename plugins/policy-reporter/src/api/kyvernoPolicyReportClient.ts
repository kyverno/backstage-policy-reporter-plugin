import { DiscoveryApi, FetchApi } from '@backstage/core-plugin-api';
import { KyvernoPolicyReportApi } from './kyvernoPolicyReportApi';
import {
  Filter,
  Pagination,
  ResultList,
} from 'backstage-plugin-policy-reporter-common';

export class KyvernoPolicyReportClient implements KyvernoPolicyReportApi {
  private readonly discoveryApi: DiscoveryApi;
  private readonly fetchApi: FetchApi;

  constructor(options: { fetchApi: FetchApi; discoveryApi: DiscoveryApi }) {
    this.discoveryApi = options.discoveryApi;
    this.fetchApi = options.fetchApi;
  }

  /**
   * Creates a URL query string from a given parameters object.
   *
   * This function takes an optional object of key-value pairs and converts it into a URL query string.
   * If the value of a key is an array, each element of the array will be added as a separate query parameter.
   * If the value is not undefined or null, it will be converted to a string and added as a query parameter.
   *
   * @param {Record<string, any>} [params] - An optional object containing key-value pairs to be converted into URL parameters.
   * @returns {string} - A URL query string generated from the provided parameters.
   */
  private createUrlParams(params?: Record<string, any>): string {
    const urlParams = new URLSearchParams();

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (Array.isArray(value)) {
          value.forEach(val => urlParams.append(key, val));
        } else if (value !== undefined && value !== null) {
          urlParams.append(key, value.toString());
        }
      }
    }
    return urlParams.toString();
  }

  async namespacedResults(
    environment: string,
    filter?: Filter,
    pagination?: Pagination,
  ): Promise<ResultList> {
    const baseUrl = await this.discoveryApi.getBaseUrl(
      'policy-reporter',
    );

    const urlParams = this.createUrlParams({ ...filter, ...pagination });

    const url = `${baseUrl}/namespaced-resources/${encodeURIComponent(
      environment,
    )}/results?${urlParams}`;

    const response = await this.fetchApi.fetch(url);
    if (!response.ok) {
      throw new Error('failed to fetch policies');
    }
    return await response.json();
  }
}
