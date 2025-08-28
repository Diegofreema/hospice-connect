import { ConvexAuthProvider } from '@convex-dev/auth/react';
import { ConvexReactClient } from 'convex/react';
import * as SecureStore from 'expo-secure-store';
import React, { PropsWithChildren } from 'react';
import { Platform } from 'react-native';
import { AuthProvider } from './context/auth';

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
  unsavedChangesWarning: false,
});

const secureStorage = {
  getItem: SecureStore.getItemAsync,
  setItem: SecureStore.setItemAsync,
  removeItem: SecureStore.deleteItemAsync,
};

const Provider = ({ children }: PropsWithChildren) => {
  return (
    <ConvexAuthProvider
      client={convex}
      storage={
        Platform.OS === 'android' || Platform.OS === 'ios'
          ? secureStorage
          : undefined
      }
    >
      <AuthProvider>{children}</AuthProvider>
    </ConvexAuthProvider>
  );
};

export default Provider;
