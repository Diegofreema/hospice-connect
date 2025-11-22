import LottieView from 'lottie-react-native';
import React from 'react';
import { View } from 'react-native';

export const AnimatedView = () => {
  const onNavigate = () => {};
  return (
    <View>
      <LottieView
        source={require('@/assets/images/animation.json')}
        autoPlay
        loop
        onAnimationFinish={onNavigate}
      />
    </View>
  );
};
