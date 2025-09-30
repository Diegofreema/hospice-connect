import { GoogleButton } from '@/features/authentication/components/google-button';
import { PrivacyTermsLink } from '@/features/authentication/components/privacy-term';
import { MyTitle } from '@/features/shared/components/my-title';
import { Spacer } from '@/features/shared/components/spacer';
import { Stack } from '@/features/shared/components/v-stack';

import { Wrapper } from '@/features/shared/components/wrapper';
import React from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

const LoginScreen = () => {
  return (
    <Wrapper>
      <KeyboardAwareScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        style={{ flex: 1 }}
      >
        <Spacer height={50} />
        <MyTitle title="Sign in" />
        {/* <Subtitle style={{ color: palette.black }}>
          Don&apos;t have an account?{' '}
          <PrivacyNoticeLink
            tint={palette.blue}
            onPress={() => router.push('/create')}
          >
            Create Account
          </PrivacyNoticeLink>
        </Subtitle>
        <Spacer height={30} />
        <LoginForm />m
        <DividerWithText /> */}
        <Stack flex={1} mode="flex" isCentered>
          <GoogleButton />
        </Stack>
        <PrivacyTermsLink />
      </KeyboardAwareScrollView>
    </Wrapper>
  );
};

export default LoginScreen;
