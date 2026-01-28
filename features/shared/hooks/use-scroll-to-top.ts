import { type LegendListRef } from '@legendapp/list';
import { useEffect, useRef } from 'react';

export const useScrollToTop = () => {
  const ref = useRef<LegendListRef>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.scrollToIndex({ index: 0 });
    }
  }, []);
  return ref;
};
