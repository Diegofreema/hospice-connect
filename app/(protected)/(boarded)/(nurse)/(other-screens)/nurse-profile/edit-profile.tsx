import { EditProfile } from '@/features/nurse/components/edit-profile';
import { BackButton } from '@/features/shared/components/back-button';
import { Spacer } from '@/features/shared/components/spacer';
import { Wrapper } from '@/features/shared/components/wrapper';
import React from 'react';

const EditProfileScreen = () => {
  return (
    <Wrapper>
      <BackButton title="Edit Profile" marginTop={0} />
      <Spacer />
      <EditProfile />
    </Wrapper>
  );
};

export default EditProfileScreen;
