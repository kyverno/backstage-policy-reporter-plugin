export interface Config {
  policyReporter?: {
    /**
     * Optional HTTP headers forwarded with every outbound request to every Policy Reporter API
     * Typically used to authenticate through a gateway/proxy.
     * @visibility backend
     */
    requestHeaders?: { [key: string]: string };
    plugins?: {
      vap?: {
        /**
         * Optional HTTP headers forwarded with every outbound request to every Policy Reporter VAP plugin API
         * Typically used for the plugin's basic auth. Not shared with the Policy Reporter API.
         * @visibility secret
         */
        requestHeaders?: { [key: string]: string };
      };
    };
  };
}
