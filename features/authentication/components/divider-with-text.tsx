import { HorizontalDivider } from '@/components/divider/horizontal/Divider';
import Text from '@/features/shared/components/text';
import View from '@/features/shared/components/view';
import React from 'react';

export const DividerWithText = () => {
  return (
    <View
      flexDirection={'row'}
      alignItems={'center'}
      gap={'s'}
      marginVertical={'xl'}
    >
      <HorizontalDivider /> <Text color={'textGrey'}>Or Continue with</Text>
      <HorizontalDivider />
    </View>
  );
};
