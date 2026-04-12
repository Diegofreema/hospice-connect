import { expoClient } from '@better-auth/expo/client';
import {
  convexClient,
  crossDomainClient,
} from '@convex-dev/better-auth/client/plugins';
import {
  emailOTPClient,
  inferAdditionalFields,
  twoFactorClient,
} from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
export const authClient = createAuthClient({
  baseURL: process.env.EXPO_PUBLIC_CONVEX_SITE_URL,
  // Disable session refetch on focus for native platforms.
  // On Android, returning from a native picker (image gallery, file system)
  // triggers an AppState "active" event, which causes better-auth to refetch
  // the session. This momentarily resets auth state, causing navigation guards
  // to re-evaluate and send the user back to the first screen.
  sessionOptions: {
    refetchOnWindowFocus: Platform.OS === 'web',
  },
  plugins: [
    emailOTPClient(),
    twoFactorClient({
      // onTwoFactorRedirect: ({ twoFactorMethods }) => {},
    }),
    inferAdditionalFields({
      user: {
        role: {
          required: true,
          defaultValue: 'nurse',
          type: 'string',
        },
        isBoarded: {
          type: 'boolean',
          defaultValue: false,
          required: true,
        },
        streamToken: {
          type: 'string',
          required: false,
        },
      },
    }),
    convexClient(),
    // @ts-ignore
    ...(Platform.OS === 'web'
      ? [crossDomainClient()]
      : [
          expoClient({
            scheme: Constants.expoConfig?.scheme as string,
            storagePrefix: Constants.expoConfig?.scheme as string,
            storage: SecureStore,
          }),
        ]),
  ],
});
