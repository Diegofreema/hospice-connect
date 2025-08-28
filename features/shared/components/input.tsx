import React, { ReactNode } from 'react';
import { StyleSheet, TextInput, TextInputProps } from 'react-native';
import Text from './text';
import View from './view';

type Props = TextInputProps & {
  label?: string;
  rightIcon?: ReactNode;
  leftIcon?: ReactNode;
};

export const Input = ({ label, rightIcon, leftIcon, ...props }: Props) => {
  return (
    <View style={{ width: '100%', gap: 10, minHeight: 55 }}>
      <Text>{label}</Text>
      <View
        style={styles.container}
        flexDirection={'row'}
        alignItems={'center'}
        gap={'s'}
      >
        {leftIcon}
        <TextInput {...props} style={{ flex: 1 }} />
        {rightIcon}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
});
