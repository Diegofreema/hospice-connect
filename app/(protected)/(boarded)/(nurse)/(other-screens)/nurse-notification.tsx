import { useNurse } from '@/components/context/nurse-context';
import { api } from '@/convex/_generated/api';
import { FetchNurseNotification } from '@/features/nurse/components/nurse-notifications';
import { BackButton } from '@/features/shared/components/back-button';
import { Wrapper } from '@/features/shared/components/wrapper';
import { useMutation } from 'convex/react';
import React, { useEffect } from 'react';

const NurseNotification = () => {
  const { nurse } = useNurse();
  const markAsRead = useMutation(api.nurseNotifications.markNotificationAsRead);

  useEffect(() => {
    if (nurse) {
      const onMark = async () => {
        try {
          await markAsRead({
            nurseId: nurse._id,
          });
        } catch (error) {
          console.log(error);
        }
      };
      onMark();
    }
  }, [nurse, markAsRead]);
  return (
    <Wrapper>
      <BackButton title="Notification" marginTop={0} marginLeft={-20} />
      <FetchNurseNotification nurseId={nurse?._id!} />
    </Wrapper>
  );
};

export default NurseNotification;
