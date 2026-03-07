import { PrivacyNoticeLink } from '@/components/privacy-notice/privacy-notice-link';
import { Subtitle } from '@/components/subtitle/Subtitle';
import { DividerWithText } from '@/features/authentication/components/divider-with-text';
import { RegisterForm } from '@/features/authentication/components/form/register-form';
import { LoginButton } from '@/features/authentication/components/google-button';
import { PrivacyTermsLink } from '@/features/authentication/components/privacy-term';
import { BackButton } from '@/features/shared/components/back-button';
import { MyTitle } from '@/features/shared/components/my-title';
import { Wrapper } from '@/features/shared/components/wrapper';

import { router } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

const CreateAccountScreen = () => {
  return (
    <Wrapper>
      <BackButton />
      <KeyboardAwareScrollView
        contentContainerStyle={{ flexGrow: 1, gap: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <MyTitle title="Create an account" />
        <Subtitle isBlack>
          Already have an account?{' '}
          <PrivacyNoticeLink onPress={() => router.push('/')}>
            Log in
          </PrivacyNoticeLink>
        </Subtitle>

        <RegisterForm />
        {Platform.OS === 'android' && <DividerWithText />}
        {Platform.OS === 'android' && <LoginButton provider="google" />}
        <PrivacyTermsLink />
      </KeyboardAwareScrollView>
    </Wrapper>
  );
};

export default CreateAccountScreen;
