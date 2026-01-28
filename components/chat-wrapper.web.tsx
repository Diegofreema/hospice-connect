import { PropsWithChildren } from 'react';
import { View } from '@/features/shared/components/view';
import { Text } from '@/features/shared/components/text';

export const ChatWrapper = ({ children }: PropsWithChildren) => {
  return (
    <View>
      {children}
      <Text size="small" textAlign="center">
        Chat is available on mobile. Web chat is coming soon.
      </Text>
    </View>
  );
};

