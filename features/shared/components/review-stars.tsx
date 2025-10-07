import { useEffect, useState } from 'react';
import { Text, TouchableWithoutFeedback, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

interface ReviewStarProps {
  readOnly?: boolean;
  rating?: number;
  onRatingChange?: (rating: number) => void;
  fontSize?: number;
}

const Star = ({
  index,
  selected,
  onPress,
  readOnly,
  fontSize,
}: {
  index: number;
  selected: boolean;
  onPress: () => void;
  readOnly?: boolean;
  fontSize?: number;
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const handlePress = () => {
    if (readOnly) return;

    // Start animation
    scale.value = withSpring(1.2, { damping: 10, stiffness: 100 });
    opacity.value = withTiming(0.7, { duration: 100 });

    // Call onPress immediately
    runOnJS(onPress)();

    // Reset animation after a short delay
    setTimeout(() => {
      scale.value = withTiming(1, { duration: 200 });
      opacity.value = withTiming(1, { duration: 200 });
    }, 100);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <TouchableWithoutFeedback onPress={handlePress} disabled={readOnly}>
      <Animated.View style={[styles.starContainer, animatedStyle]}>
        <Text
          style={[
            styles.star(fontSize),
            selected ? styles.selectedStar : styles.unselectedStar,
          ]}
        >
          ★
        </Text>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};
export const ReviewStar = ({
  readOnly = false,
  rating = 0,
  onRatingChange,
  fontSize,
}: ReviewStarProps) => {
  const [internalRating, setInternalRating] = useState(rating);

  // Sync with external rating prop changes
  useEffect(() => {
    setInternalRating(rating);
  }, [rating]);

  const handleStarPress = (index: number) => {
    if (readOnly) return;
    const newRating = index + 1;
    setInternalRating(newRating);
    onRatingChange?.(newRating);
  };

  const displayedRating = readOnly ? rating : internalRating;

  return (
    <View style={styles.container}>
      {[0, 1, 2, 3, 4].map((index) => (
        <Star
          key={index}
          index={index}
          selected={index < displayedRating}
          onPress={() => handleStarPress(index)}
          readOnly={readOnly}
          fontSize={fontSize}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  starContainer: {
    marginHorizontal: 2,
  },
  star: (fontSize?: number) => ({
    fontSize: fontSize || 30,
    textAlign: 'center',
  }),
  selectedStar: {
    color: theme.colors.blue, // Golden
  },
  unselectedStar: {
    color: '#D3D3D3', // Gray
  },
}));
