import { ViewAssignment } from '@/features/nurse/components/view-assignment';
import { BackButton } from '@/features/shared/components/back-button';
import { Wrapper } from '@/features/shared/components/wrapper';
import { type Id } from '@/convex/_generated/dataModel';
import { useLocalSearchParams } from 'expo-router';

const ViewAssignmentScreen = () => {
  const { id, nurseId, nurseNotificationId, type } = useLocalSearchParams<{
    id: Id<'schedules'>;
    nurseId: Id<'nurses'>;
    nurseNotificationId: Id<'nurseNotifications'>;
    type: 'admin' | 'assignment' | 'normal' | 'reassignment';
  }>();

  return (
    <Wrapper>
      <BackButton title="Assignment Details" marginTop={0} />
      <ViewAssignment
        id={id}
        nurseId={nurseId}
        nurseNotificationId={nurseNotificationId}
        type={type}
      />
    </Wrapper>
  );
};

export default ViewAssignmentScreen;
