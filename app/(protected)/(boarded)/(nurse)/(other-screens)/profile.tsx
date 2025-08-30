import { BackButton } from '@/features/shared/components/back-button';
import { Wrapper } from '@/features/shared/components/wrapper';
import React from 'react';

const ProfileScreen = () => {
  return (
    <Wrapper>
      <BackButton title="Profile" marginTop={0} />
    </Wrapper>
  );
};

export default ProfileScreen;
