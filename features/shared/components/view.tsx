import React, { PropsWithChildren } from 'react';
import {
  DimensionValue,
  View as RNView,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

type Props = {
  flex?: number;
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  p?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  mt?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  mb?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  ml?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  mr?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  pb?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  pl?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  pr?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  pt?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  px?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  py?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'full';
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'baseline';
  justifyContent?:
    | 'flex-start'
    | 'center'
    | 'flex-end'
    | 'space-between'
    | 'space-around';
  backgroundColor?: string;
  maxHeight?: DimensionValue | number;
  height?: DimensionValue | number;
  maxWidth?: DimensionValue | number;
  width?: DimensionValue | number;
  style?: StyleProp<ViewStyle>;
};

export const View = ({
  children,
  flex,
  alignItems,
  flexDirection,
  gap,
  p,
  mt = 'none',
  mr = 'none',
  pb,
  pl,
  pr,
  pt,
  px,
  py,
  borderRadius = 'none',
  justifyContent,
  backgroundColor,
  mb = 'none',
  ml = 'none',
  maxHeight,
  height,
  maxWidth,
  width,
  style,
}: PropsWithChildren<Props>) => {
  styles.useVariants({
    gap,
    padding: p,
    mt,
    borderRadius,
    mb,
    ml,
    mr,
    pb,
    pl,
    pr,
    pt,
    px,
    py,
  });
  return (
    <RNView
      style={[
        styles.container(
          flex,
          backgroundColor,
          alignItems,
          justifyContent,
          flexDirection,
          height,
          maxHeight,
          width,
          maxWidth
        ),
        style,
      ]}
    >
      {children}
    </RNView>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: (
    flex?: number,
    backgroundColor?: string,
    alignItems?: 'flex-start' | 'center' | 'flex-end' | 'baseline',
    justifyContent?:
      | 'flex-start'
      | 'center'
      | 'flex-end'
      | 'space-between'
      | 'space-around',
    flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse',
    height?: DimensionValue | number,
    maxHeight?: DimensionValue | number,
    width?: DimensionValue | number,
    maxWidth?: DimensionValue | number
  ) => ({
    flex,
    flexDirection,
    justifyContent,
    alignItems,
    backgroundColor,
    height,
    maxHeight,
    width,
    maxWidth,
    variants: {
      gap: {
        none: {
          gap: 0,
        },
        sm: {
          gap: theme.gap.sm,
        },
        md: {
          gap: theme.gap.md,
        },
        lg: {
          gap: theme.gap.lg,
        },
        xl: {
          gap: theme.gap.xl,
        },
        xxl: {
          gap: theme.gap.xxl,
        },
      },

      padding: {
        none: {
          padding: 0,
        },
        sm: {
          padding: theme.paddings.sm,
        },
        md: {
          padding: theme.paddings.md,
        },
        lg: {
          padding: theme.paddings.lg,
        },
        xl: {
          padding: theme.paddings.xl,
        },
        xxl: {
          padding: theme.paddings.xxl,
        },
      },
      ph: {
        none: {
          paddingHorizontal: 0,
        },
        sm: {
          paddingHorizontal: theme.paddings.sm,
        },
        paddingHorizontal: {
          padding: theme.paddings.md,
        },
        lg: {
          paddingHorizontal: theme.paddings.lg,
        },
        xl: {
          paddingHorizontal: theme.paddings.xl,
        },
        xxl: {
          paddingHorizontal: theme.paddings.xxl,
        },
      },
      pt: {
        none: {
          paddingTop: 0,
        },
        sm: {
          paddingTop: theme.paddings.sm,
        },
        md: {
          paddingTop: theme.paddings.md,
        },
        lg: {
          paddingTop: theme.paddings.lg,
        },
        xl: {
          paddingTop: theme.paddings.xl,
        },
        xxl: {
          paddingTop: theme.paddings.xxl,
        },
      },
      pb: {
        none: {
          paddingBottom: 0,
        },
        sm: {
          paddingBottom: theme.paddings.sm,
        },
        md: {
          paddingBottom: theme.paddings.md,
        },
        lg: {
          paddingBottom: theme.paddings.lg,
        },
        xl: {
          paddingBottom: theme.paddings.xl,
        },
        xxl: {
          paddingBottom: theme.paddings.xxl,
        },
      },

      pl: {
        none: {
          paddingLeft: 0,
        },
        sm: {
          paddingLeft: theme.paddings.sm,
        },
        md: {
          paddingLeft: theme.paddings.md,
        },
        lg: {
          paddingLeft: theme.paddings.lg,
        },
        xl: {
          paddingLeft: theme.paddings.xl,
        },
        xxl: {
          paddingLeft: theme.paddings.xxl,
        },
      },

      pr: {
        none: {
          paddingRight: 0,
        },
        sm: {
          paddingRight: theme.paddings.sm,
        },
        md: {
          paddingRight: theme.paddings.md,
        },
        lg: {
          paddingRight: theme.paddings.lg,
        },
        xl: {
          paddingRight: theme.paddings.xl,
        },
        xxl: {
          paddingRight: theme.paddings.xxl,
        },
      },
      px: {
        none: {
          paddingHorizontal: 0,
        },
        sm: {
          paddingHorizontal: theme.paddings.sm,
        },
        md: {
          paddingHorizontal: theme.paddings.md,
        },
        lg: {
          paddingHorizontal: theme.paddings.lg,
        },
        xl: {
          paddingHorizontal: theme.paddings.xl,
        },
        xxl: {
          paddingHorizontal: theme.paddings.xxl,
        },
      },
      py: {
        none: {
          paddingVertical: 0,
        },
        sm: {
          paddingVertical: theme.paddings.sm,
        },
        md: {
          paddingVertical: theme.paddings.md,
        },
        lg: {
          paddingVertical: theme.paddings.lg,
        },
        xl: {
          paddingVertical: theme.paddings.xl,
        },
        xxl: {
          paddingVertical: theme.paddings.xxl,
        },
      },

      margin: {
        none: {
          margin: 0,
        },
        sm: {
          margin: theme.margins.sm,
        },
        md: {
          margin: theme.margins.md,
        },
        lg: {
          margin: theme.margins.lg,
        },
        xl: {
          margin: theme.margins.xl,
        },
        xxl: {
          margin: theme.margins.xxl,
        },
      },
      mb: {
        none: {
          marginBottom: 0,
        },
        sm: {
          marginBottom: theme.margins.sm,
        },
        md: {
          marginBottom: theme.margins.md,
        },
        lg: {
          marginBottom: theme.margins.lg,
        },
        xl: {
          marginBottom: theme.margins.xl,
        },
        xxl: {
          marginBottom: theme.margins.xxl,
        },
      },

      mt: {
        none: {
          marginTop: 0,
        },
        sm: {
          marginTop: theme.margins.sm,
        },
        md: {
          marginTop: theme.margins.md,
        },
        lg: {
          marginTop: theme.margins.lg,
        },
        xl: {
          marginTop: theme.margins.xl,
        },
        xxl: {
          marginTop: theme.margins.xxl,
        },
      },
      ml: {
        none: {
          marginLeft: 0,
        },
        sm: {
          marginLeft: theme.margins.sm,
        },
        md: {
          marginLeft: theme.margins.md,
        },
        lg: {
          marginLeft: theme.margins.lg,
        },
        xl: {
          marginLeft: theme.margins.xl,
        },
        xxl: {
          marginLeft: theme.margins.xxl,
        },
      },
      mr: {
        none: {
          marginRight: 0,
        },
        sm: {
          marginRight: theme.margins.sm,
        },
        md: {
          marginRight: theme.margins.md,
        },
        lg: {
          marginRight: theme.margins.lg,
        },
        xl: {
          marginRight: theme.margins.xl,
        },
        xxl: {
          marginRight: theme.margins.xxl,
        },
      },
      borderRadius: {
        none: {
          borderRadius: 0,
        },
        sm: {
          borderRadius: theme.borderRadius.sm,
        },
        md: {
          borderRadius: theme.borderRadius.md,
        },
        lg: {
          borderRadius: theme.borderRadius.lg,
        },
        xl: {
          borderRadius: theme.borderRadius.xl,
        },
        xxl: {
          borderRadius: theme.borderRadius.xxl,
        },
        full: {
          borderRadius: 9999,
        },
      },
    },
  }),
}));
