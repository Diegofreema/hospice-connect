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
    <View style={{ gap: 10, minHeight: 55 }} flex={1}>
      {label && <Text>{label}</Text>}
      <View
        style={styles.container}
        flexDirection={'row'}
        alignItems={'center'}
        gap={'s'}
        flex={1}
      >
        {leftIcon}
        <TextInput
          {...props}
          placeholderTextColor={'grey'}
          style={{ flex: 1 }}
        />
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
    paddingVertical: 18,
    paddingHorizontal: 10,
    minHeight: 50,
  },
});
