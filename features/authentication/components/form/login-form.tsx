import { PrivacyNoticeLink } from '@/components/privacy-notice/privacy-notice-link';
import { Button } from '@/features/shared/components/button';
import { Spacer } from '@/features/shared/components/spacer';
import View from '@/features/shared/components/view';
import { useToast } from '@/hooks/use-toast';
import { palette } from '@/theme';
import { useAuthActions } from '@convex-dev/auth/react';
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
import { loginSchema, LoginSchema } from '../../validators';
import { ControlInput } from './control-input';
export const LoginForm = () => {
  const [secured, setSecured] = useState(true);
  const { signIn } = useAuthActions();
  const { showToast } = useToast();
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
    void signIn('password-custom', {
      password: data.password,
      flow: 'signIn',
      email: data.email,
    })
      .then(() => {
        reset();
      })
      .catch((error) => {
        let errorMessage = 'Failed to login';
        if (error.message.includes('InvalidAccountId')) {
          errorMessage = 'Invalid email or password, please try again.';
        }
        showToast({
          title: 'Login Failed',
          description: errorMessage,
          type: 'error',
        });
        console.error('Login error:', error.message);
        // Optionally, display an error message to the user here
      });
  };
  const toggleSecure = () => {
    setSecured(!secured);
  };
  return (
    <View gap={'m'}>
      <ControlInput
        control={control}
        errors={errors}
        name="email"
        label="Email Address"
        placeholder="Johndoe@gmail.com"
        leftIcon={<IconMail color={palette.iconGrey} />}
        autoCapitalize="none"
      />
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
      <PrivacyNoticeLink
        style={{ alignSelf: 'flex-end' }}
        onPress={() => router.push('/forgot-password')}
      >
        Forgot Password?
      </PrivacyNoticeLink>
      <Spacer />
      <Button
        label="Login"
        disabled={isSubmitting}
        onPress={handleSubmit(onSubmit)}
        loading={isSubmitting}
        loadingText="Logging in..."
      />
    </View>
  );
};
