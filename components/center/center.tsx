import React from 'react';
import { View } from 'react-native';
import type { CenterTypes } from './center.types';

export const Center: React.FC<CenterTypes> = ({
  children,
  ...props
}): React.ReactNode & React.JSX.Element => {
  return (
    <View
      {...props}
      className={'items-center justify-center' + props.className}
    >
      {children}
    </View>
  );
};
