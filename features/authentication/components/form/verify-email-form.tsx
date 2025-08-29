import { OtpInput } from '@/components/otp-input';
import { PrivacyNoticeLink } from '@/components/privacy-notice/privacy-notice-link';
import { Button } from '@/features/shared/components/button';
import { Spacer } from '@/features/shared/components/spacer';
import Text from '@/features/shared/components/text';
import View from '@/features/shared/components/view';
import { useTimer } from '@/hooks/use-timer';
import { useToast } from '@/hooks/use-toast';
import { palette } from '@/theme';
import { useAuthActions } from '@convex-dev/auth/react';
import React, { useState } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';

type Props = {
  email: string;
  password: string;
};

export const VerifyEmailForm = ({ email, password }: Props) => {
  const { signIn } = useAuthActions();
  const [otpValue, setOtpValue] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { startTimer, timeLeft } = useTimer();
  const { width } = useWindowDimensions();
  const { showToast } = useToast();
  const otpInputWidth = (width - 50) / 6;
  const clearOtp = (): void => {
    setOtpValue('');
  };

  const handleOtpFinished = async (code: string): Promise<void> => {};
  const handleOtpChange = (code: string): void => {
    setOtpValue(code);
  };

  const handleResendCode = () => {
    setLoading(true);
    void signIn('password-custom', { email, password, flow: 'signUp' })
      .then(() => {
        clearOtp();
        startTimer();
      })
      .then(() => {
        showToast({
          title: 'Success',
          description: 'Verification code sent successfully.',
          type: 'success',
        });
      })
      .catch(() => {
        showToast({
          title: 'Error',
          description:
            'Failed to verify email. Check if your email or verification code is correct.',
          type: 'error',
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const onSubmit = () => {
    void signIn('password-custom', {
      email,
      code: otpValue,
      flow: 'email-verification',
    })
      .then(() => {
        clearOtp();
        showToast({
          title: 'Success',
          description:
            'Your email has been verified. welcome to HospiceConnect',
          type: 'success',
        });
      })
      .catch((e) => {
        showToast({
          title: 'Error',
          description:
            'Failed to verify email. Check if your email or verification code is correct.',
          type: 'error',
        });
      });
  };

  return (
    <View alignItems={'flex-start'} gap={'s'} width={'100%'}>
      <OtpInput
        otpCount={5}
        containerStyle={styles.otpInputContainer}
        otpInputStyle={[styles.otpInputStyle]}
        textStyle={styles.otpTextStyle}
        inputWidth={otpInputWidth}
        inputHeight={72}
        inputBorderRadius={12}
        enableAutoFocus={true}
        onInputChange={handleOtpChange}
        onInputFinished={handleOtpFinished}
        focusedColor={palette.greenLight}
      />
      <Text variant={'body'}>Didn’t receive the code ?</Text>
      <PrivacyNoticeLink onPress={handleResendCode} disabled={timeLeft > 0}>
        Resend Code
      </PrivacyNoticeLink>
      <Spacer />
      <View width={'100%'}>
        <Button
          label="Verify"
          onPress={onSubmit}
          disabled={loading}
          loading={loading}
          loadingText="Verifying..."
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  otpContainer: {
    marginBottom: 24,
    marginTop: 24,
  },
  otpInputContainer: {
    gap: 12,
  },
  otpInputStyle: {
    backgroundColor: palette.greenLight,
    color: palette.black,
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  otpTextStyle: {
    color: palette.black,
    fontSize: 24,
    fontWeight: '600',
  },
});
