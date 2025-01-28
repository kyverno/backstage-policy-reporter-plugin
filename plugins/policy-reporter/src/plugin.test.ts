import { policyReporterPlugin } from './plugin';

describe('policy-reporter', () => {
  it('should export plugin', () => {
    expect(policyReporterPlugin).toBeDefined();
  });
});
