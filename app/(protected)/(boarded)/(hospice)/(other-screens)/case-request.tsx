import { useHospice } from '@/components/context/hospice-context';
import { Id } from '@/convex/_generated/dataModel';
import FetchCaseRequest from '@/features/hospice/components/fetch-case-requests';
import { BackButton } from '@/features/shared/components/back-button';
import { Wrapper } from '@/features/shared/components/wrapper';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';

const CaseRequestScreen = () => {
  const { nurseId, shiftId, notificationId } = useLocalSearchParams<{
    nurseId: Id<'nurses'>;
    shiftId: Id<'schedules'>;
    notificationId: Id<'hospiceNotifications'>;
  }>();
  const { hospice } = useHospice();

  if (!hospice || !hospice._id) {
    return null;
  }

  return (
    <Wrapper>
      <BackButton title="Case Request" marginTop={0} />
      <FetchCaseRequest
        nurseId={nurseId!}
        scheduleId={shiftId!}
        hospiceId={hospice._id}
        notificationId={notificationId}
      />
    </Wrapper>
  );
};

export default CaseRequestScreen;
