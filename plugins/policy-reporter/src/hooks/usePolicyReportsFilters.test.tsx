import { renderHook, act, render, screen, fireEvent } from '@testing-library/react';
import {
  MemoryRouter,
  Route,
  Routes,
  createMemoryRouter,
  RouterProvider,
  useNavigate,
} from 'react-router-dom';
import React from 'react';
import {
  PolicyReportsFiltersProvider,
  usePolicyReportsFilters,
} from './usePolicyReportsFilters';

const createWrapper =
  (initialUrl = '/') =>
  ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter initialEntries={[initialUrl]}>
      <Routes>
        <Route
          path="*"
          element={
            <PolicyReportsFiltersProvider>
              {children}
            </PolicyReportsFiltersProvider>
          }
        />
      </Routes>
    </MemoryRouter>
  );

const createWrapperWithDefaults =
  (defaults: Record<string, unknown>, initialUrl = '/') =>
  ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter initialEntries={[initialUrl]}>
      <Routes>
        <Route
          path="*"
          element={
            <PolicyReportsFiltersProvider defaults={defaults as any}>
              {children}
            </PolicyReportsFiltersProvider>
          }
        />
      </Routes>
    </MemoryRouter>
  );

describe('usePolicyReportsFilters', () => {
  describe('initialisation', () => {
    it('returns empty filter when URL has no filter params', () => {
      const { result } = renderHook(() => usePolicyReportsFilters(), {
        wrapper: createWrapper('/'),
      });

      expect(result.current.filter).toEqual({});
    });

    it('reads filter from URL on mount', () => {
      const { result } = renderHook(() => usePolicyReportsFilters(), {
        wrapper: createWrapper('/?filter[status][0]=fail&filter[status][1]=warn'),
      });

      expect(result.current.filter).toEqual({ status: ['fail', 'warn'] });
    });

    it('applies defaults when URL has no filter params', () => {
      const { result } = renderHook(() => usePolicyReportsFilters(), {
        wrapper: createWrapperWithDefaults({ status: ['fail'] }),
      });

      expect(result.current.filter).toEqual({ status: ['fail'] });
    });

    it('prefers URL params over defaults', () => {
      const { result } = renderHook(() => usePolicyReportsFilters(), {
        wrapper: createWrapperWithDefaults(
          { status: ['fail'] },
          '/?filter[status][0]=pass',
        ),
      });

      expect(result.current.filter).toEqual({ status: ['pass'] });
    });

    it('throws when used outside the provider', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MemoryRouter>
          <Routes>
            <Route path="*" element={<>{children}</>} />
          </Routes>
        </MemoryRouter>
      );

      expect(() =>
        renderHook(() => usePolicyReportsFilters(), { wrapper }),
      ).toThrow('usePolicyReportsFilters must be used within PolicyReportsFiltersProvider');
    });
  });

  describe('updateFilter', () => {
    it('merges partial updates into existing filter', () => {
      const { result } = renderHook(() => usePolicyReportsFilters(), {
        wrapper: createWrapperWithDefaults({ status: ['fail'] }),
      });

      act(() => {
        result.current.updateFilter({ severities: ['high'] });
      });

      expect(result.current.filter).toEqual({
        status: ['fail'],
        severities: ['high'],
      });
    });

    it('accepts a function updater', () => {
      const { result } = renderHook(() => usePolicyReportsFilters(), {
        wrapper: createWrapperWithDefaults({ status: ['fail'] }),
      });

      act(() => {
        result.current.updateFilter(prev => ({
          ...prev,
          status: [...(prev.status ?? []), 'pass'],
        }));
      });

      expect(result.current.filter.status).toEqual(['fail', 'pass']);
    });

    it('removes empty arrays from filter', () => {
      const { result } = renderHook(() => usePolicyReportsFilters(), {
        wrapper: createWrapperWithDefaults({ status: ['fail'] }),
      });

      act(() => {
        result.current.updateFilter({ status: [] });
      });

      expect(result.current.filter).toEqual({});
    });

    it('removes undefined values from filter', () => {
      const { result } = renderHook(() => usePolicyReportsFilters(), {
        wrapper: createWrapperWithDefaults({ status: ['fail'] }),
      });

      act(() => {
        result.current.updateFilter({ status: undefined });
      });

      expect(result.current.filter).toEqual({});
    });

    it('returns stable reference when update produces no change', () => {
      const { result } = renderHook(() => usePolicyReportsFilters(), {
        wrapper: createWrapperWithDefaults({ status: ['fail'] }),
      });

      const filterBefore = result.current.filter;

      act(() => {
        result.current.updateFilter({ status: ['fail'] });
      });

      expect(result.current.filter).toBe(filterBefore);
    });
  });

  describe('navigation', () => {
    const FilterDisplay = () => {
      const { filter } = usePolicyReportsFilters();
      return <div data-testid="filter">{JSON.stringify(filter)}</div>;
    };

    const NavigateButton = ({ to }: { to: string }) => {
      const navigate = useNavigate();
      return <button onClick={() => navigate(to)}>navigate</button>;
    };

    it('restores defaults when navigating to a bare route (no params)', async () => {
      const router = createMemoryRouter(
        [
          {
            path: '*',
            element: (
              <PolicyReportsFiltersProvider defaults={{ status: ['fail'] } as any}>
                <FilterDisplay />
                <NavigateButton to="/" />
              </PolicyReportsFiltersProvider>
            ),
          },
        ],
        { initialEntries: ['/?filter[status][0]=pass'] },
      );

      render(<RouterProvider router={router} />);
      expect(screen.getByTestId('filter').textContent).toContain('pass');

      await act(async () => {
        fireEvent.click(screen.getByText('navigate'));
      });

      expect(screen.getByTestId('filter').textContent).toContain('fail');
      expect(screen.getByTestId('filter').textContent).not.toContain('pass');
    });

    it('resets to empty when navigating to a bare route with no defaults', async () => {
      const router = createMemoryRouter(
        [
          {
            path: '*',
            element: (
              <PolicyReportsFiltersProvider>
                <FilterDisplay />
                <NavigateButton to="/" />
              </PolicyReportsFiltersProvider>
            ),
          },
        ],
        { initialEntries: ['/?filter[status][0]=pass'] },
      );

      render(<RouterProvider router={router} />);
      expect(screen.getByTestId('filter').textContent).toContain('pass');

      await act(async () => {
        fireEvent.click(screen.getByText('navigate'));
      });

      expect(screen.getByTestId('filter').textContent).toEqual('{}');
    });

    it('preserves unrelated query params when writing defaults to a bare route', async () => {
      const router = createMemoryRouter(
        [
          {
            path: '*',
            element: (
              <PolicyReportsFiltersProvider defaults={{ status: ['fail'] } as any}>
                <FilterDisplay />
                <NavigateButton to="/?tab=violations" />
              </PolicyReportsFiltersProvider>
            ),
          },
        ],
        { initialEntries: ['/'] },
      );

      render(<RouterProvider router={router} />);

      await act(async () => {
        fireEvent.click(screen.getByText('navigate'));
      });

      expect(screen.getByTestId('filter').textContent).toContain('fail');
      expect(router.state.location.search).toContain('tab=violations');
      expect(router.state.location.search).toContain('filter');
    });
  });
});
