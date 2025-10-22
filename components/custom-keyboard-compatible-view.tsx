import React, { PropsWithChildren } from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { KeyboardCompatibleView } from 'stream-chat-expo';

export const CustomKeyboardCompatibleView = ({
  children,
}: PropsWithChildren) => {
  const insets = useSafeAreaInsets();

  if (Platform.OS === 'android') {
    return children;
  }

  const iosVerticalOffset = insets.bottom + 55;
  return (
    <KeyboardCompatibleView keyboardVerticalOffset={iosVerticalOffset}>
      {children}
    </KeyboardCompatibleView>
  );
};
