import { useHospice } from '@/components/context/hospice-context';
import { ErrorComponent } from '@/features/shared/components/error';
import { SmallLoader } from '@/features/shared/components/small-loader';
import { UnderReview } from '@/features/shared/components/under-review';
import { useGetCustomerRC } from '@/hooks/rc/use-get-customer-rc';
import { PropsWithChildren } from 'react';
import { View } from 'react-native';
import { Paywall } from './paywall';

export const ProProvider = ({ children }: PropsWithChildren) => {
  const {
    data: customerInfo,
    isPending,
    isError,
    refetch,
  } = useGetCustomerRC();
  const { hospice } = useHospice();

  if (isPending) {
    return <SmallLoader size={50} />;
  }
  if (isError) {
    return <ErrorComponent refetch={refetch} text="Something went wrong" />;
  }
  if (!Object.entries(customerInfo.entitlements.active).length) {
    return <Paywall />;
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

  return <View style={{ flex: 1 }}>{children}</View>;
};
