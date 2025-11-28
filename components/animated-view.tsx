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
    const time = Platform.OS === 'ios' ? 3500 : 2500;
    const timer = setTimeout(() => {
      backgroundColor.value = withTiming('#000000', { duration: 600 });
    }, time);

    return () => clearTimeout(timer);
  }, [backgroundColor]);
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFinished(true);
    }, 6000);

    return () => clearTimeout(timer);
  }, [setIsFinished]);

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <LottieView
        source={require('@/assets/images/animation.json')}
        // ref={animationRef}
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
