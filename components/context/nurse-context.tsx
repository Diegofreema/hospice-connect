import { api } from '@/convex/_generated/api';
import { LoadingComponent } from '@/features/shared/components/loading';
import { UnderReview } from '@/features/shared/components/under-review';
import { useQuery } from 'convex/react';

import { FunctionReturnType } from 'convex/server';
import * as WebBrowser from 'expo-web-browser';
import * as React from 'react';

WebBrowser.maybeCompleteAuthSession();

const AuthContext = React.createContext({
  nurse: null as FunctionReturnType<typeof api.nurses.getNurse> | null,
});

export const NurseProvider = ({ children }: { children: React.ReactNode }) => {
  const nurse = useQuery(api.nurses.getNurse);

  if (nurse === undefined) {
    return <LoadingComponent />;
  }

  if (!nurse?.isApproved) {
    return <UnderReview />;
  }
  if (nurse === null) {
    return;
  }
  return (
    <AuthContext.Provider
      value={{
        nurse,
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
