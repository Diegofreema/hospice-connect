import { Id } from '@/convex/_generated/dataModel';
import { ViewAssignment } from '@/features/nurse/components/view-assignment';
import { BackButton } from '@/features/shared/components/back-button';
import { Wrapper } from '@/features/shared/components/wrapper';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';

const ViewAssignmentScreen = () => {
  const { id, nurseId, nurseNotificationId } = useLocalSearchParams<{
    id: Id<'schedules'>;
    nurseId: Id<'nurses'>;
    nurseNotificationId: Id<'nurseNotifications'>;
  }>();

  console.log({ id, nurseId, nurseNotificationId });

  return (
    <Wrapper>
      <BackButton title="Assignment Details" marginTop={0} />
      <ViewAssignment
        id={id}
        nurseId={nurseId}
        nurseNotificationId={nurseNotificationId}
      />
    </Wrapper>
  );
};

export default ViewAssignmentScreen;
