import { api } from '@/convex/_generated/api';
import { useQuery } from 'convex/react';

import { type FunctionReturnType } from 'convex/server';
import * as WebBrowser from 'expo-web-browser';
import * as React from 'react';

WebBrowser.maybeCompleteAuthSession();

type HospiceContextType = {
  hospice: FunctionReturnType<typeof api.hospices.getHospiceByUserId> | null;
  isLoading: boolean;
};

const HospiceContext = React.createContext<HospiceContextType>({
  hospice: null,
  isLoading: true,
});

export const HospiceProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const hospice = useQuery(api.hospices.getHospiceByUserId);

  // undefined = still loading; null/object = resolved
  const isLoading = hospice === undefined;

  return (
    <HospiceContext.Provider
      value={{
        hospice: hospice ?? null,
        isLoading,
      }}
    >
      {children}
    </HospiceContext.Provider>
  );
};

export const useHospice = () => {
  const context = React.useContext(HospiceContext);
  if (!context) {
    throw new Error('useHospice must be used within an HospiceProvider');
  }
  return context;
};
