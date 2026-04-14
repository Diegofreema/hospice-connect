import { useCustomerRCContext } from '@/components/context/customer-rc-context';
import { useHospice } from '@/components/context/hospice-context';
import { api } from '@/convex/_generated/api';
import { AccountBrief } from '@/features/shared/components/account-brief';
import { ErrorComponent } from '@/features/shared/components/error';
import { UnderReview } from '@/features/shared/components/under-review';
import { useQuery } from 'convex/react';
import { PropsWithChildren } from 'react';
import { View } from 'react-native';

export const ProProvider = ({ children }: PropsWithChildren) => {
  const { isPro, isPending, isError, refetch } = useCustomerRCContext();
  const { hospice } = useHospice();

  if (isError) {
    return <ErrorComponent refetch={refetch} text="Something went wrong" />;
  }
  if (hospice?.status === 'suspended') {
    return (
      <Wrapper>
        <UnderReview
          title="Account suspended"
          description="Please contact the admin to resolve this issue"
        />
      </Wrapper>
    );
  }
  if (hospice?.status === 'pending') {
    return (
      <Wrapper>
        <UnderReview />
      </Wrapper>
    );
  }
  if (hospice?.status === 'rejected') {
    return (
      <Wrapper>
        <UnderReview
          title="Hospice rejected"
          description="Please contact the admin to resolve this issue"
        />
      </Wrapper>
    );
  }
  // if (!isPro && !isPending) {
  //   return (
  //     <Wrapper>
  //       <Paywall />
  //     </Wrapper>
  //   );
  // }

  return <View style={{ flex: 1 }}>{children}</View>;
};

const Wrapper = ({ children }: PropsWithChildren) => {
  const { hospice } = useHospice();
  const unreadCount = useQuery(
    api.hospiceNotification.unreadMessagesCount,
    hospice && hospice._id ? { hospiceId: hospice._id } : 'skip',
  );
  const isVerified = hospice?.status === 'approved';
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
          verified={isVerified}
        />
      </View>
      {children}
    </View>
  );
};
