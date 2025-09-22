import { api } from '@/convex/_generated/api';
import { LoadingComponent } from '@/features/shared/components/loading';
import { UnderReview } from '@/features/shared/components/under-review';
import { convexQuery } from '@convex-dev/react-query';
import { useQuery } from '@tanstack/react-query';
import { FunctionReturnType } from 'convex/server';
import * as WebBrowser from 'expo-web-browser';
import * as React from 'react';

WebBrowser.maybeCompleteAuthSession();

const AuthContext = React.createContext({
  hospice: null as FunctionReturnType<
    typeof api.hospices.getHospiceByUserId
  > | null,
});

export const HospiceProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const {
    data: hospice,
    isPending,
    isError,
  } = useQuery(convexQuery(api.hospices.getHospiceByUserId, {}));
  if (isError) {
    throw new Error('Could not get your data');
  }

  if (isPending) {
    return <LoadingComponent />;
  }

  if (!hospice?.approved) {
    return <UnderReview />;
  }
  if (hospice === null) {
    return;
  }
  return (
    <AuthContext.Provider
      value={{
        hospice,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useHospice = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useNurse must be used within an HospiceProvider');
  }
  return context;
};
