import { Button } from '@/features/shared/components/button';
import { Spacer } from '@/features/shared/components/spacer';
import View from '@/features/shared/components/view';
import { palette } from '@/theme';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  IconEye,
  IconEyeOff,
  IconLock,
  IconMail,
} from '@tabler/icons-react-native';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { TouchableOpacity } from 'react-native';
import { loginSchema, LoginSchema } from '../../validators';
import { ControlInput } from './control-input';
export const RegisterForm = () => {
  const [secured, setSecured] = useState(true);
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
    try {
      reset();
    } catch (error) {
      console.log(error);
    }
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
