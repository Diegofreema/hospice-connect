import React from 'react';

import Animated, { LinearTransition } from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

export const HorizontalDivider: React.FC = (): React.JSX.Element => {
  return <Animated.View layout={LinearTransition} style={styles.spacer} />;
};

const styles = StyleSheet.create((theme) => ({
  spacer: {
    flex: 1,
    height: 0.5,
    backgroundColor: theme.colors.textGrey,
  },
}));
