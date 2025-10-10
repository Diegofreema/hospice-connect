import { Id } from '@/convex/_generated/dataModel';
import { BackButton } from '@/features/shared/components/back-button';
import { Wrapper } from '@/features/shared/components/wrapper';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';

const ViewRouteSheetScreen = () => {
  const { assignmentId, nurseId } = useLocalSearchParams<{
    nurseId: Id<'nurses'>;
    assignmentId: Id<'assignments'>;
  }>();
  return (
    <Wrapper>
      <BackButton marginTop={0} title="View Route Sheet" />
    </Wrapper>
  );
};

export default ViewRouteSheetScreen;
