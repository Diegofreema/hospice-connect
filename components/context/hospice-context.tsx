import { api } from '@/convex/_generated/api';
import { SmallLoader } from '@/features/shared/components/small-loader';
import { UnderReview } from '@/features/shared/components/under-review';
import { useQuery } from 'convex/react';

import { ErrorComponent } from '@/features/shared/components/error';
import { useGetCustomerRC } from '@/hooks/rc/use-get-customer-rc';
import { type FunctionReturnType } from 'convex/server';
import * as WebBrowser from 'expo-web-browser';
import * as React from 'react';
import { useAuth } from './auth';

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
  const { user } = useAuth();
  const hospice = useQuery(api.hospices.getHospiceByUserId);
  const {
    data: customerInfo,
    isPending,
    isError,
    refetch,
  } = useGetCustomerRC();
  if (hospice === undefined || isPending) {
    return <SmallLoader size={50} />;
  }

  if (isError) {
    return <ErrorComponent refetch={refetch} text="Something went wrong" />;
  }

  if (hospice?.status === 'pending') {
    return <UnderReview />;
  }
  if (hospice?.status === 'rejected') {
    return (
      <UnderReview
        title="Hospice rejected"
        description="Please contact the admin to resolve this issue"
      />
    );
  }

  if (hospice === null) {
    return;
  }

  console.log({ customerInfo });
  if (customerInfo?.activeSubscriptions.length === 0) {
    return (
      <UnderReview
        title="Hospice rejected"
        description="Please contact the admin to resolve this issue"
      />
    );
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
