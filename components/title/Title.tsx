import { getFontSize } from '@/features/shared/utils';
import React from 'react';
import { Text } from 'react-native';
import type { TitleProps } from './Title.types';

export const Title: React.FC<TitleProps> = ({
  children,
  size = 18,
  style,
  className,
  textAlign,
}): React.ReactNode => {
  return (
    <Text
      className={className}
      style={[
        style,
        {
          fontSize: getFontSize(size ? size : 18),
          textAlign,
        },
      ]}
    >
      {children}
    </Text>
  );
};
