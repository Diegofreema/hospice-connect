import React from 'react';
import { StyleProp, Text, TextStyle } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

interface SubTitleProps {
  children: React.ReactNode;
  className?: string;
  style?: StyleProp<TextStyle>;
  isBlack?: boolean;
}

export const SubTitle: React.FunctionComponent<SubTitleProps> = ({
  children,
  className,
  style,
  isBlack,
}): React.ReactNode => {
  styles.useVariants({ isBlack });
  return (
    <Text
      className="font-medium text-gray-300 text-sm"
      numberOfLines={2}
      style={[styles.container, style]}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  container: {
    // backgroundColor: "#fff",
    height: 80,
    variants: {
      isBlack: {
        true: {
          color: '#000',
        },
      },
    },
  },
});
