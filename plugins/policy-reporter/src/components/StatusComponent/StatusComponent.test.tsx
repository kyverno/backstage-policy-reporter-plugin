import React from 'react';
import { StatusComponent } from './StatusComponent';
import { Status } from 'backstage-plugin-policy-reporter-common';
import { renderInTestApp } from '@backstage/test-utils';

describe('StatusComponent', () => {
  it('renders with valid status', async () => {
    const extension = await renderInTestApp(<StatusComponent status="pass" />);
    expect(extension.getByText('PASS')).toBeTruthy();
  });

  it('renders unknown status as null', async () => {
    const extension = await renderInTestApp(
      <StatusComponent status={'unknown' as Status} />,
    );
    expect(extension.container.firstChild).toBeNull();
  });
});
