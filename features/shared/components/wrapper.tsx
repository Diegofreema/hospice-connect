import { PropsWithChildren } from 'react';

import View from './view';
type Props = {
  gap?: 's' | 'm' | 'l' | 'xl';
};

export const Wrapper = ({ children, gap = 'm' }: PropsWithChildren<Props>) => {
  return (
    <View
      flex={1}
      paddingHorizontal={'m'}
      gap={gap}
      backgroundColor={'mainBackground'}
    >
      {children}
    </View>
  );
};
