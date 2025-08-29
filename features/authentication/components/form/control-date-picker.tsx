import Text from '@/features/shared/components/text';
import View from '@/features/shared/components/view';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import React, { useState } from 'react';
import {
  Control,
  Controller,
  FieldErrors,
  FieldPath,
  FieldValues,
} from 'react-hook-form';
import { StyleSheet, TouchableOpacity } from 'react-native';
type Props<TFieldValues extends FieldValues> = {
  label?: string;

  errors: FieldErrors<TFieldValues>;
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;

  placeholder?: string;
  mode?: 'date' | 'time' | 'datetime';
};

export const ControlledDatePicker = <TFieldValues extends FieldValues>({
  label,
  control,
  errors,
  name,
  placeholder,
  mode = 'date',
}: Props<TFieldValues>) => {
  const [open, setOpen] = useState(false);
  const onShowDatePicker = () => {
    setOpen(true);
  };
  return (
    <View gap="m" flex={1}>
      <Text>{label}</Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value } }) => (
          <View>
            <TouchableOpacity
              onPress={onShowDatePicker}
              style={styles.container}
            >
              <Text style={{ color: value ? 'black' : 'grey' }}>
                {format(value || new Date(), 'PPP')}
              </Text>
            </TouchableOpacity>
            {open && (
              <DateTimePicker
                testID="dateTimePicker"
                value={value}
                mode={mode}
                is24Hour={true}
                display="spinner"
                onChange={(event, selectedDate) => {
                  setOpen(false);
                  if (event.type !== 'dismissed') {
                    onChange(selectedDate);
                  }
                }}
              />
            )}
          </View>
        )}
      />
      {errors[name]?.message && (
        <Text variant={'small'} color={'error'}>
          {typeof errors[name]?.message === 'string'
            ? errors[name]?.message
            : 'Invalid input'}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: 'grey',
    paddingHorizontal: 8,
    paddingVertical: 15,
    borderRadius: 8,
    flex: 1,
    minHeight: 50,
  },
});
