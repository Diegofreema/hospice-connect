import { PrivacyNoticeLink } from '@/components/privacy-notice/privacy-notice-link';
import { Subtitle } from '@/components/subtitle/Subtitle';
import { DividerWithText } from '@/features/authentication/components/divider-with-text';
import { LoginForm } from '@/features/authentication/components/form/login-form';
import { PrivacyTermsLink } from '@/features/authentication/components/privacy-term';
import { Button } from '@/features/shared/components/button';
import { MyTitle } from '@/features/shared/components/my-title';
import { Spacer } from '@/features/shared/components/spacer';
import { Wrapper } from '@/features/shared/components/wrapper';
import { palette } from '@/theme';
import { Image } from 'expo-image';
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
            onPress={() => router.push('/select-account')}
          >
            Create Account
          </PrivacyNoticeLink>
        </Subtitle>
        <Spacer height={30} />
        <LoginForm />
        <DividerWithText />

        <Button
          backgroundColor={'transparent'}
          borderColor={'borderColor'}
          borderWidth={1}
          label="Google"
          rightIcon={
            <Image
              source={require('@/assets/images/google.png')}
              style={{ width: 25, height: 25 }}
              contentFit="contain"
            />
          }
          onPress={() => {}}
          color="black"
        />

        <PrivacyTermsLink />
      </KeyboardAwareScrollView>
    </Wrapper>
  );
};

export default LoginScreen;
