import { api } from '@/convex/_generated/api';
import { useQuery } from 'convex/react';

import { type FunctionReturnType } from 'convex/server';
import * as WebBrowser from 'expo-web-browser';
import * as React from 'react';
import { useAuth } from './auth';

WebBrowser.maybeCompleteAuthSession();

type NurseContextType = {
  nurse: FunctionReturnType<typeof api.nurses.getNurseById> | null;
  isSuspended: boolean;
  isPending: boolean;
  isRejected: boolean;
  isLoading: boolean;
};

const NurseContext = React.createContext<NurseContextType>({
  nurse: null,
  isSuspended: false,
  isPending: false,
  isRejected: false,
  isLoading: true,
});

export const NurseProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const nurse = useQuery(api.nurses.getNurseById, {
    userId: user?.id as string,
  });

  // undefined = still loading from Convex; null/object = resolved
  const isLoading = nurse === undefined;

  return (
    <NurseContext.Provider
      value={{
        nurse: nurse ?? null,
        isSuspended: nurse?.status === 'suspended',
        isPending: nurse?.status === 'pending',
        isRejected: nurse?.status === 'rejected',
        isLoading,
      }}
    >
      {children}
    </NurseContext.Provider>
  );
};

export const useNurse = () => {
  const context = React.useContext(NurseContext);
  if (!context) {
    throw new Error('useNurse must be used within an NurseProvider');
  }
  return context;
};
