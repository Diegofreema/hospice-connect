import React, { PropsWithChildren } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

export const KeyboardAwareScrollViewComponent = ({
  children,
}: PropsWithChildren) => {
  return (
    <KeyboardAwareScrollView
      showsVerticalScrollIndicator={false}
      bottomOffset={50}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {children}
    </KeyboardAwareScrollView>
  );
};
