import { Input } from '@/features/shared/components/input';
import Text from '@/features/shared/components/text';
import React from 'react';
import {
  Control,
  Controller,
  FieldErrors,
  FieldPath,
  FieldValues,
} from 'react-hook-form';
import { TextInputProps } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

type Props<TFieldValues extends FieldValues> = TextInputProps & {
  label?: string;
  rightIcon?: React.ReactNode;
  leftIcon?: React.ReactNode;
  errors: FieldErrors<TFieldValues>;
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
};

export const ControlInput = <TFieldValues extends FieldValues>({
  control,
  errors,
  name,
  label,
  rightIcon,
  leftIcon,
  ...rest
}: Props<TFieldValues>) => {
  return (
    <KeyboardAvoidingView>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value } }) => (
          <Input
            onChangeText={onChange}
            value={value}
            label={label}
            rightIcon={rightIcon}
            leftIcon={leftIcon}
            {...rest}
          />
        )}
      />
      {errors[name]?.message && (
        <Text variant={'small'} color={'error'}>
          {typeof errors[name]?.message === 'string'
            ? errors[name]?.message
            : 'Invalid input'}
        </Text>
      )}
    </KeyboardAvoidingView>
  );
};
