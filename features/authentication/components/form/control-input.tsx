import { Input } from '@/features/shared/components/input';
import { Text } from '@/features/shared/components/text';
import { Textarea } from '@/features/shared/components/text-area';
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
  variant?: 'input' | 'textarea';
};

export const ControlInput = <TFieldValues extends FieldValues>({
  control,
  errors,
  name,
  label,
  rightIcon,
  leftIcon,
  variant = 'input',
  ...rest
}: Props<TFieldValues>) => {
  return (
    <KeyboardAvoidingView>
      <Controller
        control={control}
        name={name}
        rules={{
          required: true,
        }}
        render={({ field: { onChange, value } }) =>
          variant === 'input' ? (
            <Input
              onChangeText={onChange}
              value={value}
              label={label}
              rightIcon={rightIcon}
              leftIcon={leftIcon}
              {...rest}
            />
          ) : (
            <Textarea
              label={label as string}
              onChangeText={onChange}
              value={value}
              {...rest}
            />
          )
        }
      />
      {errors[name]?.message && (
        <Text size="small" color={'red'}>
          {typeof errors[name]?.message === 'string'
            ? errors[name]?.message
            : 'Invalid input'}
        </Text>
      )}
    </KeyboardAvoidingView>
  );
};
