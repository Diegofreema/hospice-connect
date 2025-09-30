import { Icon } from '@tabler/icons-react-native';
import React, { forwardRef } from 'react';
import {
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

type ButtonProps = {
  title?: string;
  color?: string;
  size?: number;
  icon?: Icon;
  bg?: string;
  rightIcon?: React.ReactNode;
} & TouchableOpacityProps;

export const Button = forwardRef<View, ButtonProps>(
  (
    { title, color, size, icon: Icon, bg, rightIcon, ...touchableProps },
    ref
  ) => {
    return (
      <TouchableOpacity
        ref={ref}
        {...touchableProps}
        style={[
          styles.button(bg),
          touchableProps.style,
          { opacity: touchableProps.disabled ? 0.5 : 1 },
        ]}
      >
        {Icon && (
          <Icon
            size={size || 16}
            color={color || '#fff'}
            style={{ marginRight: 8 }}
          />
        )}
        <Text style={styles.buttonText(color, size)}>{title}</Text>
        {rightIcon}
      </TouchableOpacity>
    );
  }
);

Button.displayName = 'Button';

const styles = StyleSheet.create((theme) => ({
  button: (bg?: string) => ({
    alignItems: 'center',
    backgroundColor: bg || theme.colors.blue,
    borderRadius: 6,
    elevation: 5,
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      height: 2,
      width: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  }),
  buttonText: (color?: string, size?: number) => ({
    color: color || theme.colors.buttonText,
    fontSize: size || 16,
    fontWeight: '600',
    textAlign: 'center',
  }),
}));
