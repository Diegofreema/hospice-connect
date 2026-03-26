import { AnimatedProgressBar } from '@/components/progress/AnimatedProgress';
import { Button } from '@/features/shared/components/button';
import { Spacer } from '@/features/shared/components/spacer';
import { Text } from '@/features/shared/components/text';
import { View } from '@/features/shared/components/view';

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
  changePasswordSchema,
  type ChangePasswordSchema,
} from '../../validators';
import { ControlInput } from './control-input';

export const ChangePasswordForm = () => {
  const [secured, setSecured] = useState(true);
  const [oldSecured, setOldSecured] = useState(true);
  const { theme } = useUnistyles();
  const { showToast } = useToast();

  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    reset,
    watch,
  } = useForm<ChangePasswordSchema>({
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    resolver: zodResolver(changePasswordSchema),
  });

  const { newPassword } = watch();

  const onSubmit = async (data: ChangePasswordSchema) => {
    await authClient.changePassword({
      newPassword: data.newPassword,
      currentPassword: data.oldPassword,

      fetchOptions: {
        onSuccess: () => {
          showToast({
            title: 'Success',
            subtitle: 'Password has been changed successfully',
            autodismiss: true,
          });
          reset();
          router.back();
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

  const toggleOldSecure = () => {
    setOldSecured(!oldSecured);
  };

  const passwordStrength = getPasswordStrength(newPassword || '');
  const isStrong = newPassword?.length >= 6;
  const hasUppercase = /[A-Z]/.test(newPassword || '');
  const hasSpecialCharacter = /[^A-Za-z0-9]/.test(newPassword || '');
  const hasNumber = /[0-9]/.test(newPassword || '');
  const progress = (passwordStrength.strength / 5) * 100;

  return (
    <View gap={'lg'}>
      <ControlInput
        control={control}
        errors={errors}
        name="oldPassword"
        autoCapitalize="none"
        label="Old Password"
        placeholder="Enter old password"
        leftIcon={<IconLock color={theme.colors.iconGrey} />}
        rightIcon={
          <TouchableOpacity onPress={toggleOldSecure}>
            {oldSecured ? (
              <IconEyeOff color={theme.colors.iconGrey} />
            ) : (
              <IconEye color={theme.colors.iconGrey} />
            )}
          </TouchableOpacity>
        }
        secureTextEntry={oldSecured}
      />

      <ControlInput
        control={control}
        errors={errors}
        name="newPassword"
        autoCapitalize="none"
        label="New Password"
        placeholder="Enter new password"
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
        label="Confirm New Password"
        placeholder="Confirm new password"
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
        title="Update Password"
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
