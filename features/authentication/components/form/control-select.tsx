import { Text } from '@/features/shared/components/text';
import { IconChevronDown } from '@tabler/icons-react-native';
import {
  type Control,
  Controller,
  type FieldErrors,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';
import { View } from '../../../shared/components/view';

import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { StyleSheet } from 'react-native-unistyles';
import * as DropdownMenu from 'zeego/dropdown-menu';
type Props<TFieldValues extends FieldValues> = {
  label?: string;
  errors: FieldErrors<TFieldValues>;
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  items: { label: string; value: string }[];
  placeholder?: string;
  disabled?: boolean;
};

export const ControlSelect = <TFieldValues extends FieldValues>({
  control,
  errors,
  name,
  label,
  items,
  placeholder,
  disabled,
}: Props<TFieldValues>) => {
  return (
    <KeyboardAvoidingView>
      <Text>{label}</Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value } }) => (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger style={styles.container} disabled={disabled}>
              <View
                flexDirection={'row'}
                justifyContent={'space-between'}
                width={'100%'}
                alignItems={'center'}
              >
                <Text color={value ? 'black' : 'grey'} size="normal">
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
        <Text size="small" color={'red'}>
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
