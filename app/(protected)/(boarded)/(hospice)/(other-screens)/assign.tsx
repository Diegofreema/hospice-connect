import { Assignments } from '@/features/hospice/components/assignments';
import { BackButton } from '@/features/shared/components/back-button';
import { Wrapper } from '@/features/shared/components/wrapper';
import React from 'react';

const AssignmentScreen = () => {
  return (
    <Wrapper gap="lg">
      <BackButton title="Assignments" marginTop={0} />
      <Assignments />
    </Wrapper>
  );
};

export default AssignmentScreen;
