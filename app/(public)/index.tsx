import { PrivacyNoticeLink } from '@/components/privacy-notice/privacy-notice-link';
import { Subtitle } from '@/components/subtitle/Subtitle';
import { DividerWithText } from '@/features/authentication/components/divider-with-text';
import { LoginForm } from '@/features/authentication/components/form/login-form';
import { GoogleButton } from '@/features/authentication/components/google-button';
import { PrivacyTermsLink } from '@/features/authentication/components/privacy-term';
import { MyTitle } from '@/features/shared/components/my-title';
import { Spacer } from '@/features/shared/components/spacer';
import { Wrapper } from '@/features/shared/components/wrapper';
import { palette } from '@/theme';
import { router } from 'expo-router';
import React from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

const LoginScreen = () => {
  return (
    <Wrapper>
      <KeyboardAwareScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Spacer height={50} />
        <MyTitle title="Sign in" />
        <Subtitle style={{ color: palette.black }}>
          Don&apos;t have an account?{' '}
          <PrivacyNoticeLink
            tint={palette.blue}
            onPress={() => router.push('/create')}
          >
            Create Account
          </PrivacyNoticeLink>
        </Subtitle>
        <Spacer height={30} />
        <LoginForm />
        <DividerWithText />

        <GoogleButton />

        <PrivacyTermsLink />
      </KeyboardAwareScrollView>
    </Wrapper>
  );
};

export default LoginScreen;
