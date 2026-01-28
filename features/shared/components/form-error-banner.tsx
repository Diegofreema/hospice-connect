import { useEffect } from 'react';
import { type FieldErrors, type FieldValues } from 'react-hook-form';
import { Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useUnistyles } from 'react-native-unistyles';

type Props<T extends FieldValues> = {
  errors: FieldErrors<T>;
};

export const FormErrorBanner = <T extends FieldValues>({
  errors,
}: Props<T>) => {
  const { theme } = useUnistyles();
  const height = useSharedValue(0);
  const opacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value,
    opacity: opacity.value,
  }));
  // Extract error messages from the errors object
  // We filter out any non-string messages or nested objects that don't have a message
  const errorMessages = Object.values(errors)
    .map((error) => {
      if (error && typeof error === 'object' && 'message' in error) {
        return error.message as string;
      }
      return null;
    })
    .filter((message): message is string => Boolean(message));

  useEffect(() => {
    if (errorMessages.length === 0) {
      height.value = withSpring(0);
      opacity.value = withSpring(0);
    } else {
      height.value = withSpring(errorMessages.length * 24 + 24);
      opacity.value = withSpring(1);
    }
  }, [errorMessages]);

  return (
    <Animated.View
      style={[
        {
          backgroundColor: theme.colors.redLight,
          padding: theme.margins.lg,
          borderRadius: theme.borderRadius.md,
          marginBottom: theme.margins.lg,
          gap: theme.gap.sm,
        },
        animatedStyle,
      ]}
    >
      {errorMessages.map((message, index) => (
        <Text
          key={index}
          style={{
            color: theme.colors.errorText,
            fontFamily: theme.fontFamily.regular,
            fontSize: 14,
          }}
        >
          • {message}
        </Text>
      ))}
    </Animated.View>
  );
};
