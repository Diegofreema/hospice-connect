import { expoClient } from '@better-auth/expo/client';
import {
  convexClient,
  crossDomainClient,
} from '@convex-dev/better-auth/client/plugins';
import { inferAdditionalFields } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
export const authClient = createAuthClient({
  baseURL: process.env.EXPO_PUBLIC_CONVEX_SITE_URL,
  plugins: [
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
