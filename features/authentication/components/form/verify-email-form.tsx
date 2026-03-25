import { useToast } from '@/components/demos/toast';
import { OtpInput } from '@/components/otp-input';
import { PrivacyNoticeLink } from '@/components/privacy-notice/privacy-notice-link';
import { Button } from '@/features/shared/components/button';
import { Spacer } from '@/features/shared/components/spacer';
import { Text } from '@/features/shared/components/text';

import { useTimer } from '@/hooks/use-timer';
import { authClient } from '@/lib/auth-client';
import { router } from 'expo-router';

import { useState } from 'react';
import { useWindowDimensions, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

type Props = {
  email: string;
};

export const VerifyEmailForm = ({ email }: Props) => {
  const { theme } = useUnistyles();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { startTimer, timeLeft } = useTimer();
  const { width } = useWindowDimensions();
  const { showToast } = useToast();
  const otpInputWidth = (width - 90) / 6;

  const handleOtpFinished = async (code: string): Promise<void> => {
    setCode(code);
  };

  const handleResendCode = async () => {
    try {
      setLoading(true);
      startTimer();
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email: email, // required
        type: 'email-verification', // required
      });
      if (error) {
        showToast({
          title: 'Error',
          subtitle: error.message,
          autodismiss: true,
        });
      } else {
        showToast({
          title: 'Success',
          subtitle: 'Otp has been sent to your email',
          autodismiss: true,
        });
      }
    } catch (error) {
      console.log(error);

      showToast({
        title: 'Error',
        subtitle: 'An unexpected error occurred. Please try again.',
        autodismiss: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    startTimer();
    setLoading(true);
    const { data, error } = await authClient.emailOtp.verifyEmail({
      email: email, // required
      otp: code, // required
    });
    if (error) {
      showToast({
        title: 'Error',
        subtitle: error.message,
        autodismiss: true,
      });
    } else {
      showToast({
        title: 'Success',
        subtitle: `Your email has been verified. Welcome to HospiceConnect ${data?.user?.name}`,
        autodismiss: true,
      });
      router.replace('/');
    }
    setLoading(false);
  };

  const disabledColor =
    timeLeft > 0 || loading ? theme.colors.grey : theme.colors.greenLight;

  return (
    <View>
      <OtpInput
        otpCount={6}
        containerStyle={styles.otpInputContainer}
        otpInputStyle={[styles.otpInputStyle]}
        textStyle={styles.otpTextStyle}
        inputWidth={otpInputWidth}
        inputHeight={72}
        inputBorderRadius={12}
        enableAutoFocus={true}
        onInputFinished={handleOtpFinished}
        focusedColor={theme.colors.greenLight}
        editable={!loading}
      />
      <Text>Didn’t receive the code ?</Text>
      <PrivacyNoticeLink
        onPress={handleResendCode}
        disabled={timeLeft > 0 || loading}
        style={{ backgroundColor: disabledColor }}
      >
        {timeLeft > 0 ? `Resend Code in ${timeLeft}s` : 'Resend Code'}
      </PrivacyNoticeLink>

      <Spacer />
      <Button
        title="Verify Email"
        onPress={handleVerifyEmail}
        disabled={loading}
      />
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  otpContainer: {
    marginBottom: 24,
    marginTop: 24,
  },
  otpInputContainer: {
    gap: 12,
  },
  otpInputStyle: {
    backgroundColor: 'transparent',
    color: theme.colors.black,
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: theme.colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  otpTextStyle: {
    color: theme.colors.black,
    fontSize: 24,
    fontWeight: '600',
  },
}));
