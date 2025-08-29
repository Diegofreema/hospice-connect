import { OtpInput } from '@/components/otp-input';
import { AnimatedProgressBar } from '@/components/progress/AnimatedProgress';
import { Button } from '@/features/shared/components/button';
import { Spacer } from '@/features/shared/components/spacer';
import Text from '@/features/shared/components/text';
import View from '@/features/shared/components/view';
import { useToast } from '@/hooks/use-toast';
import { palette } from '@/theme';
import { useAuthActions } from '@convex-dev/auth/react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  IconCheck,
  IconEye,
  IconEyeOff,
  IconLock,
  IconX,
} from '@tabler/icons-react-native';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { resetPasswordSchema, ResetPasswordSchema } from '../../validators';
import { ControlInput } from './control-input';
export const ResetForm = ({ email }: { email: string }) => {
  const [secured, setSecured] = useState(true);
  const { signIn } = useAuthActions();
  const { width } = useWindowDimensions();
  const { showToast } = useToast();
  const otpInputWidth = (width - 50) / 6;
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    reset,
    watch,
  } = useForm<ResetPasswordSchema>({
    defaultValues: {
      code: '',
      password: '',
    },
    resolver: zodResolver(resetPasswordSchema),
  });
  const { password } = watch();
  const onSubmit = async (data: ResetPasswordSchema) => {
    void signIn('password-custom', {
      code: data.code,
      newPassword: data.password,
      flow: 'reset-verification',
      email,
    })
      .then(() => {
        router.push(`/`);
        reset();
        showToast({
          title: 'Success',
          description: 'Password reset successfully. Please sign in.',
          type: 'success',
        });
      })
      .catch((e) => {
        console.log({ e });
        let errorMessage;
        if (e.message.includes('already exists')) {
          errorMessage = 'Email already exists, please try a different email';
        } else {
          errorMessage = 'Failed to reset password. Please try again.';
        }
        showToast({
          title: 'An error occurred',
          description: errorMessage,
          type: 'error',
        });
      });
  };
  const toggleSecure = () => {
    setSecured(!secured);
  };
  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: '', color: '' };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const colors = [
      'bg-red-500',
      'bg-orange-500',
      'bg-yellow-500',
      'bg-blue-500',
      'bg-green-500',
    ];

    return {
      strength,
      label: labels[strength - 1] || '',
      color: colors[strength - 1] || '',
    };
  };

  const passwordStrength = getPasswordStrength(password || '');
  const isStrong = password?.length >= 6;
  const hasUppercase = /[A-Z]/.test(password || '');
  const hasSpecialCharacter = /[^A-Za-z0-9]/.test(password || '');
  const hasNumber = /[0-9]/.test(password || '');
  const progress = (passwordStrength.strength / 5) * 100;
  return (
    <View gap={'m'}>
      <View gap={'m'}>
        <Controller
          render={({ field: { onChange } }) => (
            <OtpInput
              otpCount={5}
              containerStyle={styles.otpInputContainer}
              otpInputStyle={[styles.otpInputStyle]}
              textStyle={styles.otpTextStyle}
              inputWidth={otpInputWidth}
              inputHeight={72}
              inputBorderRadius={12}
              enableAutoFocus={true}
              onInputChange={onChange}
              focusedColor={palette.greenLight}
            />
          )}
          control={control}
          name="code"
        />
        {errors['code']?.message && (
          <Text variant={'small'} color={'error'}>
            {typeof errors['code']?.message === 'string'
              ? errors['code']?.message
              : 'Invalid input'}
          </Text>
        )}
      </View>
      <ControlInput
        control={control}
        errors={errors}
        name="password"
        autoCapitalize="none"
        label="Password"
        placeholder="Enter password"
        leftIcon={<IconLock color={palette.iconGrey} />}
        rightIcon={
          <TouchableOpacity onPress={toggleSecure}>
            {secured ? (
              <IconEyeOff color={palette.iconGrey} />
            ) : (
              <IconEye color={palette.iconGrey} />
            )}
          </TouchableOpacity>
        }
        secureTextEntry={secured}
      />

      <View>
        <View mb="m" g={'s'}>
          <AnimatedProgressBar
            progress={progress}
            width="100%"
            height={8}
            progressColor={passwordStrength.color}
            trackColor={palette.yellowLight}
            borderRadius={12}
            animationDuration={600}
          />
          <Text variant={'body'} style={{ color: passwordStrength.color }}>
            {passwordStrength.label}
          </Text>
        </View>
        <View flexDirection={'row'} gap="s" alignItems={'center'}>
          <ValidIcon isValid={isStrong} />
          <Text color={isStrong ? 'black' : 'textGrey'}>
            At least 6 characters
          </Text>
        </View>
        <View flexDirection={'row'} gap="s" alignItems={'center'}>
          <ValidIcon isValid={hasUppercase} />
          <Text color={hasUppercase ? 'black' : 'textGrey'}>Use uppercase</Text>
        </View>
        <View flexDirection={'row'} gap="s" alignItems={'center'}>
          <ValidIcon isValid={hasNumber} />
          <Text color={hasNumber ? 'black' : 'textGrey'}>One number</Text>
        </View>
        <View flexDirection={'row'} gap="s" alignItems={'center'}>
          <ValidIcon isValid={hasSpecialCharacter} />
          <Text color={hasSpecialCharacter ? 'black' : 'textGrey'}>
            Use special characters
          </Text>
        </View>
      </View>

      <Spacer />
      <Button
        label="Create"
        disabled={isSubmitting}
        onPress={handleSubmit(onSubmit)}
        loading={isSubmitting}
        loadingText="Creating..."
      />
    </View>
  );
};

const ValidIcon = ({ isValid }: { isValid: boolean }) => {
  return isValid ? (
    <IconCheck color={palette.greenDark} size={25} />
  ) : (
    <IconX color={palette.redDark} size={25} />
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
