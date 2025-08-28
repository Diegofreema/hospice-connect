import { Toast } from '@/components/toast';
import { Button } from '@/features/shared/components/button';
import {
  ErrorToast,
  SuccessToast,
} from '@/features/shared/components/error-toast';
import View from '@/features/shared/components/view';
import { palette } from '@/theme';
import { useAuthActions } from '@convex-dev/auth/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconMail } from '@tabler/icons-react-native';
import { router } from 'expo-router';
import React from 'react';
import { useForm } from 'react-hook-form';
import { forgotPasswordSchema, ForgotPasswordSchema } from '../../validators';
import { ControlInput } from './control-input';

export const ForgotForm = () => {
  const { signIn } = useAuthActions();
  const {
    handleSubmit,
    control,

    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordSchema>({
    defaultValues: {
      email: '',
    },
    resolver: zodResolver(forgotPasswordSchema),
  });
  const onSubmit = (data: ForgotPasswordSchema) => {
    void signIn('password-custom', { email: data.email, flow: 'reset' })
      .then(() => {
        Toast.show(
          <SuccessToast title="Success" description="Reset code sent" />,
          {
            duration: 5000,
            type: 'success',
          }
        );
        router.push(`/reset-password?email=${data.email}`);
      })
      .catch(() => {
        Toast.show(
          <ErrorToast title="Error" description="Failed to send reset code" />,
          {
            duration: 5000,
            type: 'error',
          }
        );
      });
  };
  return (
    <View gap="xl">
      <ControlInput
        control={control}
        name="email"
        label="Email"
        errors={errors}
        leftIcon={<IconMail color={palette.iconGrey} />}
        keyboardType="email-address"
        placeholder="Enter your email"
        autoCapitalize="none"
      />
      <Button
        label="Send Reset Code"
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
        loading={isSubmitting}
        loadingText="Sending..."
      />
    </View>
  );
};
