import { api } from '@/convex/_generated/api';
import { SmallLoader } from '@/features/shared/components/small-loader';
import { useQuery } from 'convex/react';

import { type FunctionReturnType } from 'convex/server';
import * as WebBrowser from 'expo-web-browser';
import * as React from 'react';
import { useAuth } from './auth';

WebBrowser.maybeCompleteAuthSession();

const AuthContext = React.createContext({
  nurse: null as FunctionReturnType<typeof api.nurses.getNurseById> | null,
  isSuspended: false,
  isPending: false,
  isRejected: false,
});

export const NurseProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const nurse = useQuery(api.nurses.getNurseById, {
    userId: user?.id as string,
  });

  if (nurse === undefined) {
    return <SmallLoader size={50} />;
  }

  if (nurse === null) {
    return <SmallLoader size={50} />;
  }
  return (
    <AuthContext.Provider
      value={{
        nurse,
        isSuspended: nurse?.status === 'suspended',
        isPending: nurse?.status === 'pending',
        isRejected: nurse?.status === 'rejected',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useNurse = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useNurse must be used within an NurseProvider');
  }
  return context;
};
