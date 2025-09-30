import { Subtitle } from '@/components/subtitle/Subtitle';
import { ForgotForm } from '@/features/authentication/components/form/forgot-form';
import { BackButton } from '@/features/shared/components/back-button';
import { MyTitle } from '@/features/shared/components/my-title';
import { Spacer } from '@/features/shared/components/spacer';
import { Wrapper } from '@/features/shared/components/wrapper';

import React from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

const ResetPassword = () => {
  return (
    <Wrapper>
      <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
        <BackButton marginTop={0} />
        <Spacer height={30} />
        <MyTitle title="Change Password" />
        <Subtitle isBlack>Enter your email to reset your password</Subtitle>
        <Spacer height={50} />
        <ForgotForm link={'/new-password'} />
      </KeyboardAwareScrollView>
    </Wrapper>
  );
};

export default ResetPassword;
