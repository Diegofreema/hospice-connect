import { PrivacyNoticeLink } from '@/components/privacy-notice/privacy-notice-link';
import { Button } from '@/features/shared/components/button';
import { Spacer } from '@/features/shared/components/spacer';

import { View } from '../../../shared/components/view';

import { useToast } from '@/components/demos/toast';
import { authClient } from '@/lib/auth-client';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  IconEye,
  IconEyeOff,
  IconLock,
  IconMail,
} from '@tabler/icons-react-native';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { TouchableOpacity } from 'react-native';
import { useUnistyles } from 'react-native-unistyles';
import { toast } from 'sonner-native';
import { loginSchema, LoginSchema } from '../../validators';
import { ControlInput } from './control-input';
export const LoginForm = () => {
  const [secured, setSecured] = useState(true);

  const { showToast } = useToast();
  const { theme } = useUnistyles();
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    reset,
  } = useForm<LoginSchema>({
    defaultValues: {
      email: '',
      password: '',
    },
    resolver: zodResolver(loginSchema),
  });
  const onSubmit = async (data: LoginSchema) => {
    const res = await authClient.signIn.email({
      email: data.email,
      password: data.password,
      fetchOptions: {
        onSuccess: async ({ data }) => {
          const { user } = data;

          toast.success('Success', {
            description: `Welcome back  ${user.name}`,
            position: 'bottom-center',
          });
          reset();
        },
      },
    });

    if (res.error) {
      showToast({
        title: 'Error',
        subtitle: res.error.message,
        autodismiss: true,
      });
      return;
    }
  };
  const toggleSecure = () => {
    setSecured(!secured);
  };
  return (
    <View gap={'xl'}>
      <ControlInput
        control={control}
        errors={errors}
        name="email"
        label="Email Address"
        placeholder="Johndoe@gmail.com"
        leftIcon={<IconMail color={theme.colors.iconGrey} />}
        autoCapitalize="none"
      />
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
      <PrivacyNoticeLink
        style={{ alignSelf: 'flex-end' }}
        onPress={() => router.push('/forgot-password')}
      >
        Forgot Password?
      </PrivacyNoticeLink>
      <Spacer />
      <Button
        title="Login"
        disabled={isSubmitting}
        onPress={handleSubmit(onSubmit)}
      />
    </View>
  );
};
