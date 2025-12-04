import React, { ReactNode } from 'react';
import {
  Platform,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { Text } from './text';

type Props = TextInputProps & {
  label?: string;
  rightIcon?: ReactNode;
  leftIcon?: ReactNode;
};

export const Input = ({ label, rightIcon, leftIcon, ...props }: Props) => {
  return (
    <View style={{ gap: 10, minHeight: 55 }}>
      {label && <Text>{label}</Text>}
      <View style={styles.container}>
        {leftIcon}
        <TextInput
          {...props}
          placeholderTextColor={'grey'}
          style={{ flex: 1, color: 'black' }}
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
    paddingVertical: 5,
    height: Platform.OS === 'ios' ? 50 : 55,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});
