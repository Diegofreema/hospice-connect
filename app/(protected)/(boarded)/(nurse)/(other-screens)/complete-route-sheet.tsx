import { Id } from '@/convex/_generated/dataModel';
import { CompleteRouteSheet } from '@/features/nurse/components/complete-route-sheet';
import { BackButton } from '@/features/shared/components/back-button';
import { Wrapper } from '@/features/shared/components/wrapper';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';

const CompleteRouteSheetScreen = () => {
  const { assignmentId, nurseId } = useLocalSearchParams<{
    nurseId: Id<'nurses'>;
    assignmentId: Id<'assignments'>;
  }>();
  return (
    <Wrapper>
      <BackButton title="Complete Route Sheet" marginTop={0} />
      <CompleteRouteSheet assignmentId={assignmentId!} nurseId={nurseId!} />
    </Wrapper>
  );
};

export default CompleteRouteSheetScreen;
