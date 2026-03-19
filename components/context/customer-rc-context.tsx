import { useGetCustomerRC } from '@/hooks/rc/use-get-customer-rc';
import React, { createContext, useContext, PropsWithChildren } from 'react';
import { CustomerInfo } from 'react-native-purchases';

type CustomerRCContextType = {
  customerInfo: CustomerInfo | undefined;
  isPending: boolean;
  isError: boolean;
  refetch: () => void;
  isPro: boolean;
};

const CustomerRCContext = createContext<CustomerRCContextType | null>(null);

export const CustomerRCProvider = ({ children }: PropsWithChildren) => {
  const {
    data: customerInfo,
    isPending,
    isError,
    refetch,
  } = useGetCustomerRC();

  const isPro = !!(
    customerInfo && Object.entries(customerInfo.entitlements.active).length > 0
  );

  return (
    <CustomerRCContext.Provider value={{ customerInfo, isPending, isError, refetch, isPro }}>
      {children}
    </CustomerRCContext.Provider>
  );
};

export const useCustomerRCContext = () => {
  const context = useContext(CustomerRCContext);
  if (!context) {
    throw new Error('useCustomerRCContext must be used within a CustomerRCProvider');
  }
  return context;
};
