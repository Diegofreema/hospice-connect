import { Subtitle } from '@/components/subtitle/Subtitle';
import { VerifyEmailForm } from '@/features/authentication/components/form/verify-email-form';
import { BackButton } from '@/features/shared/components/back-button';
import { MyTitle } from '@/features/shared/components/my-title';
import { Spacer } from '@/features/shared/components/spacer';
import { Wrapper } from '@/features/shared/components/wrapper';
import { palette } from '@/theme';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

const Verify = () => {
  const { email, password } = useLocalSearchParams<{
    email: string;
    password: string;
  }>();
  return (
    <Wrapper>
      <BackButton />
      <KeyboardAwareScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <MyTitle title="Enter Code" />
        <Subtitle style={{ color: palette.black }}>
          We have sent code to {email || 'example@example.com'}
        </Subtitle>
        <Spacer height={50} />
        <VerifyEmailForm email={email} password={password} />
      </KeyboardAwareScrollView>
    </Wrapper>
  );
};

export default Verify;
