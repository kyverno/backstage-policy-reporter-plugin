import { renderHook, waitFor } from '@testing-library/react';
import { useApi } from '@backstage/core-plugin-api';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import React from 'react';
import { useEnvironments } from './useEnvironments';
import { Environment } from '@kyverno/backstage-plugin-policy-reporter-common';

jest.mock('@backstage/core-plugin-api');

const createWrapper =
  (initialUrl = '/') =>
  ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter initialEntries={[initialUrl]}>
      <Routes>
        <Route path="*" element={<>{children}</>} />
      </Routes>
    </MemoryRouter>
  );

describe('useEnvironments', () => {
  const mockGetEntities = jest.fn();

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should return environments and write the first one to the URL', async () => {
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

    const { result } = renderHook(() => useEnvironments(), {
      wrapper: createWrapper('/'),
    });

    expect(result.current.environmentsLoading).toEqual(true);

    await waitFor(() => {
      expect(result.current.environmentsLoading).toEqual(false);
      expect(result.current.environments).toStrictEqual(expected);
      expect(result.current.environment).toBe('resource:default/dev');
    });
  });

  it('should not overwrite an existing ?environment= param', async () => {
    (useApi as any).mockReturnValue({
      getEntities: mockGetEntities.mockResolvedValue({
        items: [
          { metadata: { name: 'dev', namespace: 'default' }, kind: 'resource' },
          { metadata: { name: 'prod', namespace: 'default' }, kind: 'resource' },
        ],
      }),
    });

    const { result } = renderHook(() => useEnvironments(), {
      wrapper: createWrapper('/?environment=resource:default/prod'),
    });

    await waitFor(() => {
      expect(result.current.environmentsLoading).toEqual(false);
      expect(result.current.environment).toBe('resource:default/prod');
    });
  });
});

