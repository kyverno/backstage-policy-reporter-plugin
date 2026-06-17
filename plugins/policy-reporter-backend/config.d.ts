export interface Config {
  policyReporter?: {
    /**
     * Optional HTTP headers added to every outbound request to the Policy
     * Reporter REST API — e.g. to authenticate through a gateway/proxy. Header
     * values support config substitution, so secrets can be supplied via
     * environment/secret refs (e.g. ${POLICY_REPORTER_UPSTREAM_SECRET}).
     * @visibility backend
     */
    requestHeaders?: { [headerName: string]: string };
  };
}
