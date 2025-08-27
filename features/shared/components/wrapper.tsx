import { PropsWithChildren } from 'react';

import View from './view';

export const Wrapper = ({ children }: PropsWithChildren) => {
  return (
    <View flex={1} paddingHorizontal={'m'} backgroundColor={'mainBackground'}>
      {children}
    </View>
  );
};
