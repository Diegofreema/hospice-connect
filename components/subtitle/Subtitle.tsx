// make subtitle component
import React from 'react';
import { Text } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import type { SubtitleProps } from './Subtitle.props';

export const Subtitle: React.FC<SubtitleProps> = ({
  children,
  size = 13.5,
  style,
  className,
  isBlack,
}): React.ReactNode => {
  styles.useVariants({ isBlack });
  return (
    <Text
      className={className}
      style={[
        styles.text,
        {
          maxWidth: '90%',
          fontSize: size ? size : 13.5,
        },
        style,
      ]}
      numberOfLines={2}
    >
      {children}
    </Text>
  );
};
const styles = StyleSheet.create((theme) => ({
  text: {
    fontWeight: 'medium',
    color: '#a8a8a8',
    top: 3.5,
    variants: {
      isBlack: {
        true: {
          color: theme.colors.black,
        },
      },
    },
  },
}));
