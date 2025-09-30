import { Button } from '@/features/shared/components/button';
import { View } from '../../../shared/components/view';

import { useToast } from '@/components/demos/toast';
import { useAuthActions } from '@convex-dev/auth/react';
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
  const { signIn } = useAuthActions();
  const { theme } = useUnistyles();
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
          subtitle: 'Reset code sent',
        });

        router.push(`${link}?email=${data.email}` as Href);
      })
      .catch((e) => {
        console.log('RESEND ERROR', { e });

        showToast({
          title: 'Error',
          subtitle: 'Failed to send reset code',
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
