import { useEffect, useState } from 'react';
import { Dimensions } from 'react-native';

export const useResponsiveDimensions = () => {
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

  const { width, height } = dimensions;
  const scale = width / 375; // Base width

  const responsiveSize = (size: number) => {
    const newSize = size * scale;
    return Math.round(newSize);
  };

  return {
    width,
    height,
    scale,
    responsiveSize,
    isTablet: width >= 768,
    isLargeScreen: width >= 414,
  };
};
