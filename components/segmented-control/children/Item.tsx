import { useContext, useEffect } from 'react';
import { Pressable, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';
import type { SegmentedControlItemProps } from '../SegmentedControl.types';
import { SegmentedControlContext } from '../context/SegmentedControlContext';

export const SegmentedControlItem: React.FC<SegmentedControlItemProps> = ({
  value,
  children,
  className,
  style,
}: SegmentedControlItemProps) => {
  const context = useContext(SegmentedControlContext);

  if (!context) {
    throw new Error(
      'SegmentedControlItem must be used within a SegmentedControl'
    );
  }

  const { selectedValue, onValueChange, itemWidth } = context;
  const isSelected = selectedValue === value;
  const scale = useSharedValue(1);
  useEffect(() => {
    scale.value = withTiming(isSelected ? 1.1 : 1, {
      duration: 200,
    });
  }, [isSelected, scale]);
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });
  return (
    <Pressable
      onPress={() => onValueChange(value)}
      style={[
        {
          width: itemWidth,
        },
        styles.itemContainer,
        style,
      ]}
    >
      {typeof children === 'string' ? (
        <Text
          style={[
            styles.label,
            styles.lightLabel,
            isSelected && styles.selectedLabel,
          ]}
        >
          {children}
        </Text>
      ) : (
        <Animated.View style={[animatedStyle]}>{children}</Animated.View>
      )}
    </Pressable>
  );
};
const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: 'row',
    height: 40,
    borderRadius: 6,
    padding: 2,
    position: 'relative',
    alignItems: 'center',
    overflow: 'hidden',
  },
  indicator: {
    position: 'absolute',
    borderRadius: 4,
    height: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  itemContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    height: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  darkLabel: {
    color: '#a1a1aa',
  },
  lightLabel: {
    color: '#71717a',
  },
  selectedLabel: {
    color: theme.colors.blue,
    fontWeight: '600',
  },
}));
