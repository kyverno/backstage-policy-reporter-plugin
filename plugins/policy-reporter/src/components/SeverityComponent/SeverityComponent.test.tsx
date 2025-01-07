import React from 'react';
import { SeverityComponent } from './SeverityComponent';
import { renderInTestApp } from '@backstage/test-utils';

describe('SeverityComponent', () => {
  it('renders with valid severity', async () => {
    const extension = await renderInTestApp(
      <SeverityComponent severity="high" />,
    );
    expect(extension.getByText('high')).toBeTruthy();
  });

  it('dosent render anything when severity is null', async () => {
    const extension = await renderInTestApp(
      <SeverityComponent severity={null} />,
    );
    expect(extension.container.firstChild).toBeNull();
  });
});
