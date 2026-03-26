import { Subtitle } from '@/components/subtitle/Subtitle';
import { BackButton } from '@/features/shared/components/back-button';
import { MyTitle } from '@/features/shared/components/my-title';
import { Spacer } from '@/features/shared/components/spacer';
import { Wrapper } from '@/features/shared/components/wrapper';
import React from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { ChangePasswordForm } from '@/features/authentication/components/form/change-password-form';

const ChangePassword = () => {
  return (
    <Wrapper>
      <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
        <BackButton marginTop={0} />
        <Spacer height={30} />
        <MyTitle title="Change Password" />
        <Subtitle isBlack>Please enter your old and new password</Subtitle>
        <Spacer height={40} />
        <ChangePasswordForm />
      </KeyboardAwareScrollView>
    </Wrapper>
  );
};

export default ChangePassword;
