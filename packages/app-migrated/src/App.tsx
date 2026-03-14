import { apis } from './apis';
import { createFrontendModule } from '@backstage/frontend-plugin-api';

import { SignInPage } from '@backstage/core-components';
import { createApp } from '@backstage/frontend-defaults';
import { convertLegacyAppOptions } from '@backstage/core-compat-api';

const convertedOptionsModule = convertLegacyAppOptions({
  apis,
  components: {
    SignInPage: props => {
      return <SignInPage {...props} auto providers={['guest']} />;
    },
  },
});

const app = createApp({
  features: [
    createFrontendModule({
      pluginId: 'app',
      extensions: [],
    }),
    convertedOptionsModule,
  ],
});

export default app.createRoot();
