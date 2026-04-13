import { type PropsWithChildren } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

type Props = {
  mode?: 'flex' | 'column' | 'flexCentered';
  gap?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  padding?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  borderRadius?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  margin?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  mb?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  mt?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  ph?: number;
  isFlexCentered?: boolean;
  flex?: number;
  backgroundColor?: string;
  isCentered?: boolean;
  style?: StyleProp<ViewStyle>;
};

export const Stack = ({
  children,
  mode,
  borderRadius,
  gap,
  padding,
  margin,
  isFlexCentered,
  flex = 0,
  mb,
  mt,
  backgroundColor,
  ph,
  isCentered,
  style,
}: PropsWithChildren<Props>) => {
  styles.useVariants({
    mode,
    gap,
    padding,
    borderRadius,
    margin,
    isFlexCentered,
    mb,
    mt,
    isCentered,
  });
  return (
    <View style={[styles.container(flex, backgroundColor, ph), style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: (flex: number, backgroundColor?: string, ph?: number) => ({
    flex,
    backgroundColor,
    paddingHorizontal: ph,
    variants: {
      mode: {
        flex: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        column: {
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
        },
        flexCentered: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-start',
        },
      },

      gap: {
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

      margin: {
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

      borderRadius: {
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
      },

      isFlexCentered: {
        true: {
          alignItems: 'center',
          justifyContent: 'flex-start',
        },
      },
      isCentered: {
        true: {
          alignItems: 'center',
          justifyContent: 'center',
        },
      },
    },
  }),
}));
