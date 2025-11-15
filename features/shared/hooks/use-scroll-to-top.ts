import { LegendListRef } from '@legendapp/list';
import { useEffect, useRef } from 'react';

type Props<T> = {
  results: T[];
};

export const useScrollToTop = <T>({ results }: Props<T>) => {
  const ref = useRef<LegendListRef>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.scrollToIndex({ index: 0 });
    }
  }, []);
  return ref;
};
