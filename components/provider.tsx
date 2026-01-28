import { authClient } from '@/lib/auth-client';
import { ConvexBetterAuthProvider } from '@convex-dev/better-auth/react';
import { ConvexReactClient } from 'convex/react';
import React, { type PropsWithChildren } from 'react';
import { AuthProvider } from './context/auth';
const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
  expectAuth: true,
  unsavedChangesWarning: false,
});

const Provider = ({ children }: PropsWithChildren) => {
  return (
    <ConvexBetterAuthProvider client={convex} authClient={authClient}>
      <AuthProvider>{children}</AuthProvider>
    </ConvexBetterAuthProvider>
  );
};

export default Provider;
