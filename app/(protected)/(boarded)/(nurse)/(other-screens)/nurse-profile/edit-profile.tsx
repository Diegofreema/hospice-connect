import { BackButton } from '@/features/shared/components/back-button';
import { Wrapper } from '@/features/shared/components/wrapper';
import React from 'react';

const EditProfileScreen = () => {
  return (
    <Wrapper>
      <BackButton title="Edit Profile" marginTop={0} />
    </Wrapper>
  );
};

export default EditProfileScreen;
