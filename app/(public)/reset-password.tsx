import { SubTitle } from '@/components/card/children/Subtitle';
import { ResetForm } from '@/features/authentication/components/form/reset-form';
import { BackButton } from '@/features/shared/components/back-button';
import { MyTitle } from '@/features/shared/components/my-title';
import { Wrapper } from '@/features/shared/components/wrapper';

import { useLocalSearchParams } from 'expo-router';
import React from 'react';

const ResetPassword = () => {
  const { email } = useLocalSearchParams<{ email: string }>();
  return (
    <Wrapper gap="md">
      <BackButton />
      <MyTitle title="Create new password" />
      <SubTitle isBlack>Please create a new password</SubTitle>
      <ResetForm email={email} />
    </Wrapper>
  );
};

export default ResetPassword;
