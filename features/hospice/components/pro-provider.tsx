import { useCustomerRCContext } from '@/components/context/customer-rc-context';
import { useHospice } from '@/components/context/hospice-context';
import { api } from '@/convex/_generated/api';
import { AccountBrief } from '@/features/shared/components/account-brief';
import { ErrorComponent } from '@/features/shared/components/error';
import { SmallLoader } from '@/features/shared/components/small-loader';
import { UnderReview } from '@/features/shared/components/under-review';
import { useQuery } from 'convex/react';
import { PropsWithChildren } from 'react';
import { View } from 'react-native';
import { Paywall } from './paywall';

export const ProProvider = ({ children }: PropsWithChildren) => {
  const { isPro, isPending, isError, refetch } = useCustomerRCContext();
  const { hospice } = useHospice();
  const unreadCount = useQuery(
    api.hospiceNotification.unreadMessagesCount,
    hospice && hospice._id ? { hospiceId: hospice._id } : 'skip',
  );
  if (isPending) {
    return <SmallLoader size={50} />;
  }
  if (isError) {
    return <ErrorComponent refetch={refetch} text="Something went wrong" />;
  }
  if (hospice?.status === 'suspended') {
    return (
      <UnderReview
        title="Hospice suspended"
        description="Please contact the admin to resolve this issue"
      />
    );
  }
  if (!isPro) {
    return (
      <View style={{ flex: 1, backgroundColor: 'white', gap: 15 }}>
        <View style={{ paddingHorizontal: 16 }}>
          <AccountBrief
            data={{
              name: hospice?.businessName || 'N/A',
              image: hospice?.image as string,
            }}
            title="Hello,"
            href={'/business-profile'}
            isHome
            count={unreadCount || 0}
          />
        </View>
        <Paywall />
      </View>
    );
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
