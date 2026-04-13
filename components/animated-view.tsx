import { useAuth } from '@/components/context/auth';
import { useAnimationStore } from '@/hooks/use-animation';
import LottieView from 'lottie-react-native';
import React, { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

export const AnimatedView = () => {
  const setIsFinished = useAnimationStore((state) => state.setIsFinished);
  const { isPending } = useAuth();
  const backgroundColor = useSharedValue<'#fff' | '#000000'>('#fff');

  // Track whether the 6-second minimum animation timer has elapsed.
  const timerDoneRef = useRef(false);

  // Keep a ref that is always up-to-date with the latest isPending value so
  // the timer callback (which closes over the initial value) can read it
  // correctly.  This is the root cause of the "stuck on splash" bug: without
  // this ref, if auth resolves *before* the timer fires the timer reads a
  // stale isPending=true and never calls setIsFinished.
  const isPendingRef = useRef(isPending);
  isPendingRef.current = isPending;

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
      timerDoneRef.current = true;
      if (!isPendingRef.current) {
        setIsFinished(true);
      }
    }, 6000);

    // Hard fallback: if auth takes longer than 3 extra seconds after the
    // animation ends, unblock the app anyway.  Prevents an infinite stuck
    // state when the session check hangs (e.g. timeout, poor connectivity).
    const fallbackTimer = setTimeout(() => {
      setIsFinished(true);
    }, 9000);

    return () => {
      clearTimeout(colorTimer);
      clearTimeout(finishTimer);
      clearTimeout(fallbackTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount — all values accessed via refs

  // Secondary path: auth resolves *after* the timer has already fired.
  useEffect(() => {
    if (!isPending && timerDoneRef.current) {
      setIsFinished(true);
    }
  }, [isPending, setIsFinished]);

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
