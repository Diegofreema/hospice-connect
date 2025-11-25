import { HorizontalDivider } from '@/components/divider/horizontal/Divider';
import { Text } from '@/features/shared/components/text';
import { View } from '@/features/shared/components/view';

import React from 'react';
import { useUnistyles } from 'react-native-unistyles';

export const DividerWithText = () => {
  const { theme } = useUnistyles();
  return (
    <View flexDirection={'row'} alignItems={'center'} gap={'md'} my={'xl'}>
      <HorizontalDivider />
      <Text color={theme.colors.textGrey}>Or Continue with</Text>
      <HorizontalDivider />
    </View>
  );
};
