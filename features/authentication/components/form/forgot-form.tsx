import { Button } from '@/features/shared/components/button';
import { View } from '../../../shared/components/view';

import { useToast } from '@/components/demos/toast';
import { authClient } from '@/lib/auth-client';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconMail } from '@tabler/icons-react-native';
import { type Href, router } from 'expo-router';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useUnistyles } from 'react-native-unistyles';
import {
  forgotPasswordSchema,
  type ForgotPasswordSchema,
} from '../../validators';
import { ControlInput } from './control-input';

type Props = {
  link?: Href;
  isForgotPassword?: boolean;
};
// @ts-ignore
export const ForgotForm = ({
  link = '/verify',
  isForgotPassword = true,
}: Props) => {
  const { theme } = useUnistyles();
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordSchema>({
    defaultValues: {
      email: '',
    },
    resolver: zodResolver(forgotPasswordSchema),
  });
  const { showToast } = useToast();
  const onSubmit = async (values: ForgotPasswordSchema) => {
    await authClient.emailOtp.requestPasswordReset({
      email: values.email,

      fetchOptions: {
        onSuccess: () => {
          showToast({
            title: 'Success',
            subtitle: 'Otp sent successfully',
            autodismiss: true,
          });
          router.push({
            // @ts-ignore
            pathname: link,
            params: {
              email: values.email,
              isForgotPassword: isForgotPassword ? 'true' : 'false',
            },
          });
          reset();
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
  return (
    <View gap="xl">
      <ControlInput
        control={control}
        name="email"
        label="Email"
        errors={errors}
        leftIcon={<IconMail color={theme.colors.iconGrey} />}
        keyboardType="email-address"
        placeholder="Enter your email"
        autoCapitalize="none"
      />

      <Button
        title="Send Reset Code"
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
      />
    </View>
  );
};
