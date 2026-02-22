import { Subscriptions } from '@/features/hospice/components/subscriptions';
import { BackButton } from '@/features/shared/components/back-button';
import { Wrapper } from '@/features/shared/components/wrapper';
import React from 'react';

const SubscriptionScreen = () => {
  return (
    <Wrapper>
      <BackButton title="Subscription" marginTop={0} />
      <Subscriptions />
    </Wrapper>
  );
};

export default SubscriptionScreen;
