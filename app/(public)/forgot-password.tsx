import { SubTitle } from '@/components/card/children/Subtitle';
import { ForgotForm } from '@/features/authentication/components/form/forgot-form';
import { BackButton } from '@/features/shared/components/back-button';
import { MyTitle } from '@/features/shared/components/my-title';
import { Spacer } from '@/features/shared/components/spacer';
import { Wrapper } from '@/features/shared/components/wrapper';

import React from 'react';

const ForgotPassword = () => {
  return (
    <Wrapper gap="sm">
      <BackButton />
      <Spacer height={30} />
      <MyTitle title="Forgot Password" />
      <SubTitle isBlack>Enter your email to reset your password</SubTitle>

      <ForgotForm />
    </Wrapper>
  );
};

export default ForgotPassword;
