import { Button } from '@/features/shared/components/button';
import { View } from '../../../shared/components/view';

import { useToast } from '@/components/demos/toast';
import { authClient } from '@/lib/auth-client';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconMail } from '@tabler/icons-react-native';
import { Href, router } from 'expo-router';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useUnistyles } from 'react-native-unistyles';
import { forgotPasswordSchema, ForgotPasswordSchema } from '../../validators';
import { ControlInput } from './control-input';

type Props = {
  link?: Href;
};
export const ForgotForm = ({ link = '/reset-password' }: Props) => {
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
    const { data, error } = await authClient.requestPasswordReset({
      email: values.email,
    });

    if (error) {
      showToast({
        title: 'Error',
        subtitle: error.message,
        autodismiss: true,
      });
    }

    if (data) {
      showToast({
        title: 'Success',
        subtitle: data.message,
        autodismiss: true,
      });
      router.push(link);
      reset();
    }
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
