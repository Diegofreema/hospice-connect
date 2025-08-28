import { Button } from '@/features/shared/components/button';
import { Spacer } from '@/features/shared/components/spacer';
import Text from '@/features/shared/components/text';
import View from '@/features/shared/components/view';
import { palette } from '@/theme';
import { useAuthActions } from '@convex-dev/auth/react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  IconCheck,
  IconEye,
  IconEyeOff,
  IconLock,
  IconMail,
  IconX,
} from '@tabler/icons-react-native';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { TouchableOpacity } from 'react-native';
import { loginSchema, LoginSchema } from '../../validators';
import { ControlInput } from './control-input';
export const RegisterForm = () => {
  const [secured, setSecured] = useState(true);
  const { signIn } = useAuthActions();

  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    reset,
    watch,
  } = useForm<LoginSchema>({
    defaultValues: {
      email: '',
      password: '',
    },
    resolver: zodResolver(loginSchema),
  });
  const { password } = watch();
  const onSubmit = async (data: LoginSchema) => {
    try {
      void signIn('password-custom', {
        email: data.email,
        password: data.password,
        flow: 'signUp',
      }).then(() => {
        router.push(`/verify?email=${data.email}&password=${data.password}`);
      });

      reset();
    } catch (error) {
      console.log(error);
    }
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
      <View>
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
