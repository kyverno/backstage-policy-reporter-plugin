import { renderHook, act } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import React from 'react';
import { useEnvironmentParam } from './useEnvironmentParam';

const createWrapper =
  (initialUrl = '/') =>
  ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter initialEntries={[initialUrl]}>
      <Routes>
        <Route path="*" element={<>{children}</>} />
      </Routes>
    </MemoryRouter>
  );

describe('useEnvironmentParam', () => {
  it('returns undefined when no param is set', () => {
    const { result } = renderHook(() => useEnvironmentParam(), {
      wrapper: createWrapper('/'),
    });

    expect(result.current.environment).toBeUndefined();
  });

  it('returns the environment from the URL param', () => {
    const { result } = renderHook(() => useEnvironmentParam(), {
      wrapper: createWrapper('/?environment=resource:default/dev'),
    });

    expect(result.current.environment).toBe('resource:default/dev');
  });

  it('setEnvironment updates the URL param', () => {
    const { result } = renderHook(() => useEnvironmentParam(), {
      wrapper: createWrapper('/?environment=resource:default/dev'),
    });

    act(() => {
      result.current.setEnvironment('resource:default/prod');
    });

    expect(result.current.environment).toBe('resource:default/prod');
  });
});
