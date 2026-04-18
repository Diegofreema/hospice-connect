import { useAnimationStore } from '@/hooks/use-animation';
import LottieView from 'lottie-react-native';
import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

export const AnimatedView = () => {
  const setIsFinished = useAnimationStore((state) => state.setIsFinished);
  const backgroundColor = useSharedValue<'#fff' | '#000000'>('#fff');

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: backgroundColor.value,
  }));

  useEffect(() => {
    const colorTime = Platform.OS === 'ios' ? 3500 : 2500;

    // Colour transition (unchanged from original).
    const colorTimer = setTimeout(() => {
      backgroundColor.value = withTiming('#000000', { duration: 600 });
    }, colorTime);

    // Minimum animation duration.  Read from the ref so we always see the
    // latest isPending value, regardless of when auth resolved.
    const finishTimer = setTimeout(() => {
      setIsFinished(true);
    }, 6000);

    return () => {
      clearTimeout(colorTimer);
      clearTimeout(finishTimer);
    };
  }, [backgroundColor, setIsFinished]);

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <LottieView
        source={require('@/assets/images/animation.json')}
        autoPlay
        style={styles.container}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
