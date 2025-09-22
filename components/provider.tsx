import { ConvexAuthProvider } from '@convex-dev/auth/react';
import { ConvexQueryClient } from '@convex-dev/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConvexReactClient } from 'convex/react';
import * as SecureStore from 'expo-secure-store';
import React, { PropsWithChildren } from 'react';
import { Platform } from 'react-native';
import { AuthProvider } from './context/auth';
const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
  unsavedChangesWarning: false,
});
const convexQueryClient = new ConvexQueryClient(convex);
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryKeyHashFn: convexQueryClient.hashFn(),
      queryFn: convexQueryClient.queryFn(),
    },
  },
});
convexQueryClient.connect(queryClient);

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
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    </ConvexAuthProvider>
  );
};

export default Provider;
