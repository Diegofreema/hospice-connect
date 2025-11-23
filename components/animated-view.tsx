import LottieView from 'lottie-react-native';
import React from 'react';
import { View } from 'react-native';

export const AnimatedView = () => {
  const onNavigate = () => {};
  return (
    <View style={{ flex: 1 }}>
      <LottieView
        source={require('@/assets/images/animation.json')}
        autoPlay
        loop
        onAnimationFinish={onNavigate}
        style={{ flex: 1 }}
      />
    </View>
  );
};
