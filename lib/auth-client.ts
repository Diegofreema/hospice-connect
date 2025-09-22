import { expoClient } from '@better-auth/expo/client';
import { convexClient } from '@convex-dev/better-auth/client/plugins';
import { emailOTPClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
// import { polyfillWebCrypto } from 'expo-standard-web-crypto';
// polyfillWebCrypto();
export const authClient = createAuthClient({
  baseURL: 'https://pastel-albatross-709.convex.site',
  plugins: [
    expoClient({
      scheme: Constants.expoConfig?.scheme as string,
      storagePrefix: Constants.expoConfig?.scheme as string,
      storage: SecureStore,
    }),
    emailOTPClient(),
    convexClient(),
  ],
});
