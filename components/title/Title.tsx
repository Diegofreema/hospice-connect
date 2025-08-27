import React from 'react';
import { Text } from 'react-native';
import type { TitleProps } from './Title.types';

export const Title: React.FC<TitleProps> = ({
  children,
  size = 18,
  style,
  className,
}): React.ReactNode => {
  return (
    <Text
      className={className}
      style={[
        style,
        {
          fontSize: size ? size : 18,
        },
      ]}
    >
      {children}
    </Text>
  );
};
