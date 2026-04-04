import { AnimatedProgressBar } from '@/components/progress/AnimatedProgress';
import { Button } from '@/features/shared/components/button';

import { Spacer } from '@/features/shared/components/spacer';
import { Text } from '@/features/shared/components/text';
import { View } from '../../../shared/components/view';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  IconCheck,
  IconEye,
  IconEyeOff,
  IconLock,
  IconMail,
  IconUser,
  IconX,
} from '@tabler/icons-react-native';

import { useToast } from '@/components/demos/toast';
import { authClient } from '@/lib/auth-client';
import { router } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { TouchableOpacity } from 'react-native';
import { useUnistyles } from 'react-native-unistyles';
import { type RegisterSchema, registerSchema } from '../../validators';
import { ControlInput } from './control-input';
export const RegisterForm = () => {
  const [secured, setSecured] = useState(true);
  const [secured2, setSecured2] = useState(true);

  const { theme } = useUnistyles();
  const { showToast } = useToast();
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    reset,
    watch,
  } = useForm<RegisterSchema>({
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      password: '',
      confirmPassword: '',
    },
    resolver: zodResolver(registerSchema),
  });
  const { password } = watch();
  const onSendOtp = async (email: string) => {
    await authClient.emailOtp.sendVerificationOtp({
      email: email.trim(), // required
      type: 'email-verification', // required
      fetchOptions: {
        onSuccess: () => {
          router.push({
            pathname: '/verify',
            params: {
              email: email.trim(),
            },
          });
          showToast({
            title: 'Success',
            subtitle: 'Otp has been sent to your email',
            autodismiss: true,
          });
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
  const onSubmit = async (values: RegisterSchema) => {
    await authClient.signUp.email({
      email: values.email.trim(),
      password: values.password.trim(),
      name: `${values.firstName.trim()} ${values.lastName.trim()}`.trim(),
      // @ts-ignore
      isBoarded: false,
      role: 'nurse',
      fetchOptions: {
        onSuccess: () => {
          onSendOtp(values.email);
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
  const toggleSecure = () => {
    setSecured(!secured);
  };
  const toggleSecure2 = () => {
    setSecured2(!secured2);
  };
  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: '', color: '' };

    let strength = 0;
    if (password.length >= 6) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const colors = [
      theme.colors.redDark,
      theme.colors.orange,
      theme.colors.yellowDark,
      theme.colors.blue,
      theme.colors.greenDark,
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
  const progress = (passwordStrength.strength / 5) * 100;
  return (
    <View gap={'xl'}>
      <ControlInput
        control={control}
        errors={errors}
        name="firstName"
        label="First name"
        placeholder="John"
        leftIcon={<IconUser color={theme.colors.iconGrey} />}
        autoCapitalize="words"
      />

      <ControlInput
        control={control}
        errors={errors}
        name="lastName"
        label="Last name"
        placeholder="Doe"
        leftIcon={<IconUser color={theme.colors.iconGrey} />}
        autoCapitalize="words"
      />
      <ControlInput
        control={control}
        errors={errors}
        name="email"
        label="Email Address"
        placeholder="Johndoe@gmail.com"
        leftIcon={<IconMail color={theme.colors.iconGrey} />}
        autoCapitalize="none"
        keyboardType="email-address"
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
      <ControlInput
        control={control}
        errors={errors}
        name="confirmPassword"
        autoCapitalize="none"
        label="Confirm Password"
        placeholder="Re-enter password"
        leftIcon={<IconLock color={theme.colors.iconGrey} />}
        rightIcon={
          <TouchableOpacity onPress={toggleSecure2}>
            {secured2 ? (
              <IconEyeOff color={theme.colors.iconGrey} />
            ) : (
              <IconEye color={theme.colors.iconGrey} />
            )}
          </TouchableOpacity>
        }
        secureTextEntry={secured2}
      />
      <View>
        <View mb="md" gap={'sm'}>
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
