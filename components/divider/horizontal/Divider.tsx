import { palette } from '@/theme';
import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';

export const HorizontalDivider: React.FC = (): React.JSX.Element => {
  return <Animated.View layout={LinearTransition} style={styles.spacer} />;
};

const styles = StyleSheet.create({
  spacer: {
    flex: 1,
    height: 0.5,
    backgroundColor: palette.textGrey,
  },
});
