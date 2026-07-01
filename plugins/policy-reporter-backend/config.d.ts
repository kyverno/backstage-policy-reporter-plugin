export interface Config {
  policyReporter?: {
    /**
     * Optional HTTP headers forwarded with every outbound request to every Policy Reporter API
     * Typically used to authenticate through a gateway/proxy.
     * @visibility backend
     */
    requestHeaders?: { [key: string]: string };
  };
}
