import { useGetCustomerRC } from '@/hooks/rc/use-get-customer-rc';
import React, { createContext, PropsWithChildren, useContext } from 'react';
import { CustomerInfo, PurchasesEntitlementInfo } from 'react-native-purchases';

type CustomerRCContextType = {
  customerInfo: CustomerInfo | undefined;
  isPending: boolean;
  isError: boolean;
  refetch: () => void;
  isPro: boolean;
  activeEntitlement: PurchasesEntitlementInfo;
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
    customerInfo &&
    Object.entries(customerInfo.entitlements?.active ?? {}).length > 0
  );

  const activeEntitlement = Object.entries(
    customerInfo?.entitlements?.active ?? {},
  )[0]?.[1];
  return (
    <CustomerRCContext.Provider
      value={{
        customerInfo,
        isPending,
        isError,
        refetch,
        isPro,
        activeEntitlement,
      }}
    >
      {children}
    </CustomerRCContext.Provider>
  );
};

export const useCustomerRCContext = () => {
  const context = useContext(CustomerRCContext);
  if (!context) {
    throw new Error(
      'useCustomerRCContext must be used within a CustomerRCProvider',
    );
  }
  return context;
};
