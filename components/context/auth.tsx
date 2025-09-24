import * as WebBrowser from 'expo-web-browser';
import * as React from 'react';

import { api } from '@/convex/_generated/api';
import { Doc } from '@/convex/_generated/dataModel';
import { LoadingComponent } from '@/features/shared/components/loading';
import { convexQuery } from '@convex-dev/react-query';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useMutation } from 'convex/react';

WebBrowser.maybeCompleteAuthSession();

const AuthContext = React.createContext({
  user: null as Doc<'users'> | null,
  isAuthenticated: false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const {
    data: user,
    isPending,
    isError,
  } = useQuery(convexQuery(api.users.getUser, {}));

  const [loading, setLoading] = React.useState(false);
  const updateStreamToken = useMutation(api.users.updateStreamToken);
  React.useEffect(() => {
    if (!user) return;
    setLoading(true);
    const tokenProvider = async () => {
      try {
        const { data } = await axios.post(
          `https://hospice-connect-web.vercel.app/api/token`,
          {
            name: user?.name,
            email: user?.email,
            image: user?.image || '',
            id: user?._id,
          }
        );

        await updateStreamToken({ streamToken: data.token });
      } catch (error) {
        console.error('error', error);
        throw new Error('Failed to fetch user data');
      } finally {
        setLoading(false);
      }
    };
    tokenProvider();
  }, [updateStreamToken, user]);
  const isAuthenticated = !!user;

  const isLoading = isPending || loading;
  if (isError) {
    throw new Error('Could not get your data');
  }
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
