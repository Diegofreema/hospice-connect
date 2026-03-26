import { AnimatedProgressBar } from '@/components/progress/AnimatedProgress';
import { Button } from '@/features/shared/components/button';
import { Spacer } from '@/features/shared/components/spacer';
import { Text } from '@/features/shared/components/text';

import { View } from '../../../../features/shared/components/view';

import { useToast } from '@/components/demos/toast';
import { getPasswordStrength } from '@/features/shared/utils';
import { authClient } from '@/lib/auth-client';
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
import { useForm } from 'react-hook-form';
import { TouchableOpacity } from 'react-native';
import { useUnistyles } from 'react-native-unistyles';
import {
  resetPasswordSchema,
  type ResetPasswordSchema,
} from '../../validators';
import { ControlInput } from './control-input';
export const ResetForm = ({ email, otp }: { email: string; otp: string }) => {
  const [secured, setSecured] = useState(true);
  const { theme } = useUnistyles();
  const { showToast } = useToast();

  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    reset,
    watch,
  } = useForm<ResetPasswordSchema>({
    defaultValues: {
      password: '',
    },
    resolver: zodResolver(resetPasswordSchema),
  });
  const { password } = watch();
  const onSubmit = async (data: ResetPasswordSchema) => {
    await authClient.emailOtp.resetPassword({
      email: email, // required
      otp: otp, // required
      password: data.password, // required
      fetchOptions: {
        onSuccess: () => {
          showToast({
            title: 'Success',
            subtitle: 'Password has been reset successfully',
            autodismiss: true,
          });
          reset();
          router.replace('/');
        },
        onError: ({ error }) => {
          showToast({
            title: 'Error',
            subtitle: error.message,
            autodismiss: true,
          });
        },
      },
    });
  };
  const toggleSecure = () => {
    setSecured(!secured);
  };

  const passwordStrength = getPasswordStrength(password || '');
  const isStrong = password?.length >= 6;
  const hasUppercase = /[A-Z]/.test(password || '');
  const hasSpecialCharacter = /[^A-Za-z0-9]/.test(password || '');
  const hasNumber = /[0-9]/.test(password || '');
  const progress = (passwordStrength.strength / 5) * 100;
  return (
    <View gap={'lg'}>
      <ControlInput
        control={control}
        errors={errors}
        name="password"
        autoCapitalize="none"
        label="Password"
        placeholder="Enter password"
        leftIcon={<IconLock color={theme.colors.iconGrey} />}
        rightIcon={
          <TouchableOpacity onPress={toggleSecure}>
            {secured ? (
              <IconEyeOff color={theme.colors.iconGrey} />
            ) : (
              <IconEye color={theme.colors.iconGrey} />
            )}
          </TouchableOpacity>
        }
        secureTextEntry={secured}
      />
      <ControlInput
        control={control}
        errors={errors}
        name="confirmPassword"
        autoCapitalize="none"
        label="Confirm Password"
        placeholder="Enter confirm password"
        leftIcon={<IconLock color={theme.colors.iconGrey} />}
        rightIcon={
          <TouchableOpacity onPress={toggleSecure}>
            {secured ? (
              <IconEyeOff color={theme.colors.iconGrey} />
            ) : (
              <IconEye color={theme.colors.iconGrey} />
            )}
          </TouchableOpacity>
        }
        secureTextEntry={secured}
      />

      <View>
        <View mb="md" gap={'sm'} mt="md">
          <AnimatedProgressBar
            progress={progress}
            width="100%"
            height={8}
            progressColor={passwordStrength.color}
            trackColor={theme.colors.yellowLight}
            borderRadius={12}
            animationDuration={600}
          />
          <Text color={passwordStrength.color}>{passwordStrength.label}</Text>
        </View>
        <View flexDirection={'row'} gap="sm" alignItems={'center'}>
          <ValidIcon isValid={isStrong} />
          <Text color={isStrong ? 'black' : 'textGrey'}>
            At least 6 characters
          </Text>
        </View>
        <View flexDirection={'row'} gap="sm" alignItems={'center'}>
          <ValidIcon isValid={hasUppercase} />
          <Text color={hasUppercase ? 'black' : 'textGrey'}>Use uppercase</Text>
        </View>
        <View flexDirection={'row'} gap="sm" alignItems={'center'}>
          <ValidIcon isValid={hasNumber} />
          <Text color={hasNumber ? 'black' : 'textGrey'}>One number</Text>
        </View>
        <View flexDirection={'row'} gap="sm" alignItems={'center'}>
          <ValidIcon isValid={hasSpecialCharacter} />
          <Text color={hasSpecialCharacter ? 'black' : 'textGrey'}>
            Use special characters
          </Text>
        </View>
      </View>

      <Spacer />
      <Button
        title="Create"
        disabled={isSubmitting}
        onPress={handleSubmit(onSubmit)}
      />
    </View>
  );
};

const ValidIcon = ({ isValid }: { isValid: boolean }) => {
  const { theme } = useUnistyles();
  return isValid ? (
    <IconCheck color={theme.colors.greenDark} size={25} />
  ) : (
    <IconX color={theme.colors.redDark} size={25} />
  );
};
