import { useHospice } from '@/components/context/hospice-context';
import { api } from '@/convex/_generated/api';
import { Notifications } from '@/features/hospice/components/notification';
import { BackButton } from '@/features/shared/components/back-button';
import { Wrapper } from '@/features/shared/components/wrapper';
import { useMutation } from 'convex/react';
import React, { useEffect } from 'react';

const HospiceNotification = () => {
  const { hospice } = useHospice();

  const markAsRead = useMutation(
    api.hospiceNotification.markNotificationAsRead
  );

  useEffect(() => {
    if (hospice) {
      const onMark = async () => {
        if (!hospice._id) return;
        try {
          await markAsRead({
            hospiceId: hospice._id,
          });
        } catch (error) {
          console.log(error);
        }
      };
     void onMark();
    }
  }, [hospice, markAsRead]);
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
