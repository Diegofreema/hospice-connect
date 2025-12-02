import { DuplicateComponent } from '@/features/hospice/components/duplicate';
import { BackButton } from '@/features/shared/components/back-button';
import { Wrapper } from '@/features/shared/components/wrapper';
import React from 'react';

const DuplicateAssignmentScreen = () => {
  return (
    <Wrapper>
      <BackButton marginTop={0} />
      <DuplicateComponent />
    </Wrapper>
  );
};

export default DuplicateAssignmentScreen;
