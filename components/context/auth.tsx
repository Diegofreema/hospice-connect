import * as WebBrowser from 'expo-web-browser';
import * as React from 'react';

import { api } from '@/convex/_generated/api';
import { Doc } from '@/convex/_generated/dataModel';
import { LoadingComponent } from '@/features/shared/components/loading';
import { useQuery } from 'convex/react';

WebBrowser.maybeCompleteAuthSession();

const AuthContext = React.createContext({
  user: null as Doc<'users'> | null | undefined,
  isAuthenticated: false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const user = useQuery(api.users.getUser, {});
  console.log({ image: user?.image });

  const isAuthenticated = !!user;
  const isLoading = user === undefined;

  if (isLoading) {
    return <LoadingComponent />;
  }
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
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
