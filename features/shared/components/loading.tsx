import { CircleLoadingIndicator } from '@/components/loaders';
import React from 'react';
import View from './view';

export const LoadingComponent = () => {
  return (
    <View
      flex={1}
      justifyContent="center"
      alignItems="center"
      bg="mainBackground"
    >
      <CircleLoadingIndicator />
    </View>
  );
};
