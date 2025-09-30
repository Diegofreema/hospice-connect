import { forwardRef, PropsWithChildren } from 'react';
import { Text as RNText, StyleProp, TextStyle } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { getFontSize } from '../utils';

type Props = {
  size?: 'small' | 'medium' | 'large' | 'xlarge' | 'normal';
  isBold?: boolean;
  textAlign?: 'left' | 'center' | 'right' | undefined;
  color?: string;
  isMedium?: boolean;
  style?: StyleProp<TextStyle>;
  fontSize?: number;
};

export const Text = forwardRef<RNText, PropsWithChildren<Props>>(
  (
    {
      textAlign,
      children,
      size = 'normal',
      isBold,
      color,
      isMedium,
      style,
      fontSize,
    },
    ref
  ) => {
    styles.useVariants({
      size,
      isBold,
      isMedium,
    });
    return (
      <RNText ref={ref} style={[styles.text(textAlign, color), style]}>
        {children}
      </RNText>
    );
  }
);

Text.displayName = 'Text';

const styles = StyleSheet.create((theme) => ({
  text: (
    textAlign: 'left' | 'center' | 'right' | undefined,
    color?: string,
    fontSize?: number
  ) => ({
    color: color || theme.colors.typography,
    fontFamily: theme.fontFamily.regular,
    fontSize,
    textAlign,
    variants: {
      size: {
        small: {
          fontSize: getFontSize(12),
          fontFamily: theme.fontFamily.regular,
        },
        normal: {
          fontSize: getFontSize(14),
          fontFamily: theme.fontFamily.regular,
        },
        medium: {
          fontSize: getFontSize(16),
          fontFamily: theme.fontFamily.regular,
        },
        large: {
          fontSize: getFontSize(20),
          fontFamily: theme.fontFamily.medium,
        },
        xlarge: {
          fontSize: getFontSize(24),
          fontFamily: theme.fontFamily.bold,
        },
      },
      isBold: {
        true: {
          fontFamily: theme.fontFamily.bold,
        },
      },
      isMedium: {
        true: {
          fontFamily: theme.fontFamily.medium,
        },
      },
    },
  }),
}));
