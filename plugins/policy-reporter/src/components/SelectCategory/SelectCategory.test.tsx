import { TestApiProvider, renderInTestApp } from '@backstage/test-utils';
import { SelectCategory } from './SelectCategory';
import { policyReporterApiRef } from '../../api';
import { PolicyReportsFiltersProvider } from '../../hooks/usePolicyReportsFilters';

const mockGetCategories = jest.fn().mockResolvedValue({
  ok: true,
  json: jest
    .fn()
    .mockResolvedValue([
      'Pod Security Standards (Default)',
      'Pod Security Standards (Restricted)',
    ]),
});

const mockPolicyReportApiRef = {
  getCategories: mockGetCategories,
};

const renderWithEnv = (defaultFilters: Record<string, unknown> = {}) =>
  renderInTestApp(
    <TestApiProvider
      apis={[[policyReporterApiRef, mockPolicyReportApiRef as any]]}
    >
      <PolicyReportsFiltersProvider
        defaultEnvironment="resource:default/dev"
        defaultFilters={defaultFilters}
      >
        <SelectCategory />
      </PolicyReportsFiltersProvider>
    </TestApiProvider>,
  );

describe('SelectCategory', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the selected category provider defaults', async () => {
    const extension = await renderWithEnv({
      categories: ['Pod Security Standards (Default)'],
    });
    expect(
      extension.getAllByText('Pod Security Standards (Default)'),
    ).toBeTruthy();
    expect(extension.getByText('Category')).toBeTruthy();
  });

  it('should render multiple selected categories from provider defaults', async () => {
    const extension = await renderWithEnv({
      categories: [
        'Pod Security Standards (Default)',
        'Pod Security Standards (Restricted)',
      ],
    });
    expect(
      extension.getAllByText('Pod Security Standards (Default)'),
    ).toBeTruthy();
    expect(
      extension.getAllByText('Pod Security Standards (Restricted)'),
    ).toBeTruthy();
    expect(extension.getByText('Category')).toBeTruthy();
  });

  it('should render all when no defaults are set', async () => {
    const extension = await renderWithEnv();
    expect(extension.getByText('All')).toBeTruthy();
    expect(extension.getByText('Category')).toBeTruthy();
  });
});
