import { useToast } from '@/components/demos/toast';
import { OtpInput } from '@/components/otp-input';
import { Button } from '@/features/shared/components/button';
import { CustomPressable } from '@/features/shared/components/custom-pressable';
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
  isForgotPassword: 'true' | 'false';
};

export const VerifyEmailForm = ({ email, isForgotPassword }: Props) => {
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
    startTimer();
    if (isForgotPassword === 'true') {
      handleResendForgotPasswordOtp();
    } else {
      handleResendVerifyEmailOtp();
    }
  };
  const onPress = async () => {
    if (isForgotPassword === 'true') {
      await handleVerifyForgotPassword();
    } else {
      await handleVerifyEmail();
    }
  };

  const handleVerifyForgotPassword = async () => {
    setLoading(true);
    await authClient.emailOtp.checkVerificationOtp({
      email,
      type: 'forget-password',
      otp: code,
      fetchOptions: {
        onSuccess: () => {
          setLoading(false);
          showToast({
            title: 'Success',
            subtitle: 'Otp has been verified successfully',
            autodismiss: true,
          });
          router.push({
            // @ts-ignore
            pathname: '/reset-password',
            params: {
              email: email,
              otp: code,
            },
          });
        },
        onError: ({ error }) => {
          setLoading(false);
          showToast({
            title: 'Error',
            subtitle: error.message,
            autodismiss: true,
          });
        },
        onResponse: () => {
          setLoading(false);
        },
      },
    });
  };

  const handleVerifyEmail = async () => {
    await authClient.emailOtp.verifyEmail({
      email: email, // required
      otp: code, // required
      fetchOptions: {
        onRequest: () => {
          setLoading(true);
        },
        onError: ({ error }) => {
          setLoading(false);
          showToast({
            title: 'Error',
            subtitle: error.message,
            autodismiss: true,
          });
        },
        onSuccess: () => {
          showToast({
            title: 'Success',
            subtitle: `Your email has been verified. Welcome to HospiceConnect`,
            autodismiss: true,
          });
          router.replace('/');
          setLoading(false);
        },
        onResponse: () => {
          setLoading(false);
        },
      },
    });
  };

  const handleResendForgotPasswordOtp = async () => {
    await authClient.emailOtp.requestPasswordReset({
      email: email,
      fetchOptions: {
        onRequest: () => {
          setLoading(true);
        },
        onSuccess: () => {
          setLoading(false);
          showToast({
            title: 'Success',
            subtitle: 'Otp has been sent successfully',
            autodismiss: true,
          });
        },
        onError: ({ error }) => {
          setLoading(false);
          showToast({
            title: 'Error',
            subtitle: error.message,
            autodismiss: true,
          });
        },
        onResponse: () => {
          setLoading(false);
        },
      },
    });
  };

  const handleResendVerifyEmailOtp = async () => {
    await authClient.emailOtp.sendVerificationOtp({
      email: email, // required
      type: 'email-verification', // required
      fetchOptions: {
        onSuccess: () => {
          setLoading(false);
          showToast({
            title: 'Success',
            subtitle: 'Otp has been sent to your email',
            autodismiss: true,
          });
        },
        onError: ({ error }) => {
          setLoading(false);
          showToast({
            title: 'Error',
            subtitle: error.message,
            autodismiss: true,
          });
        },
        onResponse: () => {
          setLoading(false);
        },
      },
    });
  };

  const disabled = loading || code.length !== 6;
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
      <CustomPressable
        onPress={handleResendCode}
        disabled={timeLeft > 0 || loading}
        style={{ backgroundColor: 'transparent' }}
      >
        <Text
          style={{
            color: theme.colors.blue,
            opacity: timeLeft > 0 || loading ? 0.5 : 1,
          }}
        >
          {timeLeft > 0 ? `Resend Code in ${timeLeft}s` : 'Resend Code'}
        </Text>
      </CustomPressable>

      <Spacer />
      <Button title="Verify Email" onPress={onPress} disabled={disabled} />
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
  },

  otpTextStyle: {
    color: theme.colors.black,
    fontSize: 24,
    fontWeight: '600',
  },
}));
