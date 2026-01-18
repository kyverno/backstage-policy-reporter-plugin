import { renderHook, waitFor } from '@testing-library/react';
import { useApi } from '@backstage/core-plugin-api';
import { useNamespaces } from './useNamespaces';
import { Environment } from '@kyverno/backstage-plugin-policy-reporter-common';

jest.mock('@backstage/core-plugin-api');

describe('useNamespaces', () => {
  const mockGetNamespaces = jest.fn();

  beforeEach(() => {
    (useApi as any).mockReturnValue({
      getNamespaces: mockGetNamespaces,
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  const environment: Environment = {
    name: 'dev',
    entityRef: 'resource:default/dev',
    id: 0,
  };

  it('should return empty list if no environment provided', async () => {
    const { result } = renderHook(() => useNamespaces(undefined));

    expect(result.current.loading).toEqual(true);

    await waitFor(() => {
      expect(result.current.loading).toEqual(false);
      expect(result.current.namespaces).toEqual([]);
      expect(result.current.error).toBeUndefined();
    });

    expect(mockGetNamespaces).not.toHaveBeenCalled();
  });

  it('should return namespaces', async () => {
    mockGetNamespaces.mockResolvedValue({
      json: jest.fn().mockResolvedValue(['default', 'kube-system']),
    });

    const { result } = renderHook(() => useNamespaces(environment));

    expect(result.current.loading).toEqual(true);

    await waitFor(() => {
      expect(result.current.loading).toEqual(false);
      expect(result.current.namespaces).toEqual(['default', 'kube-system']);
      expect(result.current.error).toBeUndefined();
    });

    expect(mockGetNamespaces).toHaveBeenCalledWith({
      query: { environment: environment.entityRef },
    });
  });

  it('should handle errors', async () => {
    const error = new Error('Failed to fetch');
    mockGetNamespaces.mockRejectedValue(error);

    const { result } = renderHook(() => useNamespaces(environment));

    expect(result.current.loading).toEqual(true);

    await waitFor(() => {
      expect(result.current.loading).toEqual(false);
      expect(result.current.namespaces).toEqual([]);
      expect(result.current.error).toEqual(error);
    });
  });
});
