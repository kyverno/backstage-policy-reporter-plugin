import { kyvernoPolicyReportsPlugin } from './plugin';

describe('policy-reporter', () => {
  it('should export plugin', () => {
    expect(kyvernoPolicyReportsPlugin).toBeDefined();
  });
});
