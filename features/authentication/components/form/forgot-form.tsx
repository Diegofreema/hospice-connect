import { Button } from '@/features/shared/components/button';
import View from '@/features/shared/components/view';
import { useToast } from '@/hooks/use-toast';
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
  const { showToast } = useToast();
  const onSubmit = (data: ForgotPasswordSchema) => {
    console.log({ data });

    void signIn('password-custom', { email: data.email, flow: 'reset' })
      .then(() => {
        showToast({
          title: 'Success',
          description: 'Reset code sent',
          type: 'success',
        });

        router.push(`/reset-password?email=${data.email}`);
      })
      .catch((e) => {
        console.log('RESEND ERROR', { e });

        showToast({
          title: 'Error',
          description: 'Failed to send reset code',
          type: 'error',
        });
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
