import { renderHook, waitFor } from '@testing-library/react';
import { useApi } from '@backstage/core-plugin-api';
import { useEnvironments } from './useEnvironments';
import { Environment } from '@kyverno/backstage-plugin-policy-reporter-common';

jest.mock('@backstage/core-plugin-api');

describe('useEnvironments', () => {
  const mockGetEntities = jest.fn();

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should return environments', async () => {
    (useApi as any).mockReturnValue({
      getEntities: mockGetEntities.mockResolvedValue({
        items: [
          { metadata: { name: 'dev', namespace: 'default' }, kind: 'resource' },
        ],
      }),
    });

    const expected: Environment[] = [
      {
        name: 'dev',
        entityRef: 'resource:default/dev',
        id: 0,
      },
    ];

    const { result } = renderHook(() => useEnvironments());

    expect(result.current.environmentsLoading).toEqual(true);

    await waitFor(() => {
      expect(result.current.setCurrentEnvironment).toBeDefined();
      expect(result.current.environmentsLoading).toEqual(false);
      expect(result.current.environments).toStrictEqual(expected);
      expect(result.current.environments).toContainEqual(
        result.current.currentEnvironment,
      );
    });
  });
});
