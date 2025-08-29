import Text from '@/features/shared/components/text';
import View from '@/features/shared/components/view';
import { IconChevronDown } from '@tabler/icons-react-native';
import React from 'react';
import {
  Control,
  Controller,
  FieldErrors,
  FieldPath,
  FieldValues,
} from 'react-hook-form';
import { StyleSheet } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import * as DropdownMenu from 'zeego/dropdown-menu';
type Props<TFieldValues extends FieldValues> = {
  label?: string;

  errors: FieldErrors<TFieldValues>;
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  items: { label: string; value: string }[];
  placeholder?: string;
};

export const ControlSelect = <TFieldValues extends FieldValues>({
  control,
  errors,
  name,
  label,
  items,
  placeholder,
}: Props<TFieldValues>) => {
  return (
    <KeyboardAvoidingView>
      <Text>{label}</Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value } }) => (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger style={styles.container}>
              <View
                flexDirection={'row'}
                justifyContent={'space-between'}
                width={'100%'}
                alignItems={'center'}
              >
                <Text style={{ color: value ? 'black' : 'grey' }}>
                  {items.find((item) => item.value === value)?.label ||
                    placeholder}
                </Text>
                <IconChevronDown color="grey" />
              </View>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              {items.map((item) => (
                <DropdownMenu.Item
                  key={item.value}
                  onSelect={() => onChange(item.value)}
                >
                  <DropdownMenu.ItemTitle>{item.label}</DropdownMenu.ItemTitle>
                  <DropdownMenu.CheckboxItem key={value} value="on">
                    <DropdownMenu.ItemIndicator />
                  </DropdownMenu.CheckboxItem>
                </DropdownMenu.Item>
              ))}
              <DropdownMenu.Arrow />
            </DropdownMenu.Content>
          </DropdownMenu.Root>
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

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: 'grey',
    paddingHorizontal: 8,
    paddingVertical: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 10,
    flex: 1,
    minHeight: 50,
  },
});
