import { useHospice } from '@/components/context/hospice-context';
import { Notifications } from '@/features/hospice/components/notification';
import { BackButton } from '@/features/shared/components/back-button';
import { Wrapper } from '@/features/shared/components/wrapper';
import React from 'react';

const HospiceNotification = () => {
  const { hospice } = useHospice();

  if (!hospice || !hospice._id) {
    return null;
  }
  return (
    <Wrapper>
      <BackButton title="Notifications" marginTop={0} />
      <Notifications hospiceId={hospice._id} />
    </Wrapper>
  );
};

export default HospiceNotification;
