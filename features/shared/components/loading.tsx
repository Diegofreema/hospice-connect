import { CircleLoadingIndicator } from '@/components/loaders';
import React from 'react';
import { useUnistyles } from 'react-native-unistyles';
import { Stack } from './v-stack';

export const LoadingComponent = () => {
  const { theme } = useUnistyles();
  return (
    <Stack flex={1} isCentered backgroundColor={theme.colors.background}>
      <CircleLoadingIndicator />
    </Stack>
  );
};
