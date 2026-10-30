import { renderInTestApp } from '@backstage/test-utils';
import {
  KYVERNO_PLUGIN_TRIVY_ENDPOINT_ANNOTATION,
  KYVERNO_PLUGIN_VAP_ENDPOINT_ANNOTATION,
} from '@kyverno/backstage-plugin-policy-reporter-common';
import { MissingPlugin } from './MissingPlugin';

describe('MissingPlugin', () => {
  it('names the VAP plugin and its annotation', async () => {
    const extension = await renderInTestApp(
      <MissingPlugin
        plugin="VAP"
        annotation={KYVERNO_PLUGIN_VAP_ENDPOINT_ANNOTATION}
      />,
    );

    expect(
      extension.getByText(
        'No kubernetes-cluster Resources with the VAP plugin found',
      ),
    ).toBeTruthy();
    expect(extension.getByText('kyverno.io/plugin-vap-endpoint')).toBeTruthy();
  });

  it('names the Trivy plugin and its annotation', async () => {
    const extension = await renderInTestApp(
      <MissingPlugin
        plugin="Trivy"
        annotation={KYVERNO_PLUGIN_TRIVY_ENDPOINT_ANNOTATION}
      />,
    );

    expect(
      extension.getByText(
        'No kubernetes-cluster Resources with the Trivy plugin found',
      ),
    ).toBeTruthy();
    expect(
      extension.getByText('kyverno.io/plugin-trivy-endpoint'),
    ).toBeTruthy();
  });
});
