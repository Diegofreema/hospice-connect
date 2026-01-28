import { useToast } from '@/components/demos/toast';
import { OtpInput } from '@/components/otp-input';
import { PrivacyNoticeLink } from '@/components/privacy-notice/privacy-notice-link';
import { Button } from '@/features/shared/components/button';
import { Spacer } from '@/features/shared/components/spacer';
import { Text } from '@/features/shared/components/text';

import { useTimer } from '@/hooks/use-timer';

import { useState } from 'react';
import { useWindowDimensions, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

type Props = {
  email: string;
  password: string;
};

export const VerifyEmailForm = ({ email, password }: Props) => {
  const { theme } = useUnistyles();
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
    // setLoading(true);
    // void signIn('password-custom', { email, password, flow: 'signUp' })
    //   .then(() => {
    //     clearOtp();
    //     startTimer();
    //   })
    //   .then(() => {
    //     showToast({
    //       title: 'Success',
    //       subtitle: 'Verification code sent successfully.',
    //     });
    //   })
    //   .catch(() => {
    //     showToast({
    //       title: 'Error',
    //       subtitle:
    //         'Failed to verify email. Check if your email or verification code is correct.',
    //     });
    //   })
    //   .finally(() => {
    //     setLoading(false);
    //   });
  };

  const onSubmit = () => {
    // void signIn('password-custom', {
    //   email,
    //   code: otpValue,
    //   flow: 'email-verification',
    // })
    //   .then(() => {
    //     clearOtp();
    //     showToast({
    //       title: 'Success',
    //       subtitle: 'Your email has been verified. welcome to HospiceConnect',
    //     });
    //   })
    //   .catch((e) => {
    //     showToast({
    //       title: 'Error',
    //       subtitle:
    //         'Failed to verify email. Check if your email or verification code is correct.',
    //     });
    //   });
  };

  return (
    <View>
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
        focusedColor={theme.colors.greenLight}
      />
      <Text>Didn’t receive the code ?</Text>
      <PrivacyNoticeLink onPress={handleResendCode} disabled={timeLeft > 0}>
        Resend Code
      </PrivacyNoticeLink>
      <Spacer />

      <Button title="Verify" onPress={onSubmit} disabled={loading} />
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
    backgroundColor: theme.colors.greenLight,
    color: theme.colors.black,
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
    color: theme.colors.black,
    fontSize: 24,
    fontWeight: '600',
  },
}));
