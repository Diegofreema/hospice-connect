import { PropsWithChildren } from 'react';

import View from './view';

export const Wrapper = ({ children }: PropsWithChildren) => {
  return (
    <View flex={1} paddingHorizontal={'m'}>
      {children}
    </View>
  );
};
