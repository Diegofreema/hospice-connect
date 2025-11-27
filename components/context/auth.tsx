import * as WebBrowser from 'expo-web-browser';
import * as React from 'react';

import { ErrorComponent } from '@/features/shared/components/error';
import { LoadingComponent } from '@/features/shared/components/loading';
import { authClient } from '@/lib/auth-client';

WebBrowser.maybeCompleteAuthSession();
type User = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  email: string;
  emailVerified: boolean;
  name: string;
  image?: string | null | undefined;
  userId?: string | null | undefined;
  isBoarded: boolean;
  role: string;
  streamToken?: string;
};
const AuthContext = React.createContext({
  user: null as User | null,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const {
    data: session,
    isPending,
    error,
    isRefetching,
    refetch,
  } = authClient.useSession();

  if (error) {
    return <ErrorComponent text={error.message} refetch={refetch} />;
  }

  if (isPending || isRefetching) {
    return <LoadingComponent />;
  }

  return (
    <AuthContext.Provider
      value={{
        user: session?.user as User,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
