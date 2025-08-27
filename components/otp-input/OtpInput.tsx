import { OtpItem } from "./children/OTPItem";
import { OtpContext } from "./context";
import React, { useEffect, useRef, useState } from "react";
import { TextInput, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withRepeat,
  FadeInDown,
  FadeOutDown,
} from "react-native-reanimated";
import type { IOtpInput, OtpContextProps } from "./types";
import { otpInputStyles as styles } from "./styles";

export const OtpInput = ({
  otpCount = 6,
  containerStyle = {},
  otpInputStyle = {},
  textStyle = {},
  focusedColor = "#f8fafc",

  editable = true,
  enteringAnimated = FadeInDown,
  exitingAnimated = FadeOutDown,
  onInputFinished,
  onInputChange,
  error = false,
  errorMessage = "Invalid OTP. Please try again.",
  inputBorderRadius = 20,
  inputWidth = 60,
  inputHeight = 60,
  ...rest
}: IOtpInput) => {
  const inputRef = useRef<any[]>([]);
  const data: string[] = new Array(otpCount).fill("");
  inputRef.current = data.map(
    (_, index) => (inputRef.current[index] = React.createRef<TextInput>()),
  );
  const [focus, setFocus] = useState<number>(0);
  const [otpValue, setOtpValue] = useState<string[]>(data);

  const opacity = useSharedValue(1);
  const translateX = useSharedValue(0);

  const onPress = () => {
    if (focus === -1) {
      setFocus(otpCount - 1);
      otpValue[data.length - 1] = "";
      setOtpValue([...otpValue]);
      inputRef.current[data.length - 1].current.focus();
    } else {
      inputRef.current[focus].current.focus();
    }
  };

  const onFocusNext = (value: string, index: number) => {
    if (index < data.length - 1 && value) {
      inputRef.current[index + 1].current.focus();
      setFocus(index + 1);
    }
    if (index === data.length - 1) {
      setFocus(-1);
      inputRef.current[index].current.blur();
    }
    otpValue[index] = value;
    setOtpValue([...otpValue]);
  };

  const onFocusPrevious = (key: string, index: number) => {
    if (key === "Backspace" && index !== 0) {
      inputRef.current[index - 1].current.focus();
      setFocus(index - 1);
      otpValue[index - 1] = "";
      setOtpValue([...otpValue]);
    } else if (key === "Backspace" && index === 0) {
      otpValue[0] = "";
    }
  };

  if (otpCount < 4 && otpCount > 6) {
    throw "OTP Count min is 4 and max is 6";
  }

  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateX: translateX.value }],
    };
  });

  const triggerCompleteAnimation = () => {
    opacity.value = withTiming(0.6, { duration: 100 });
    opacity.value = withTiming(1, { duration: 100 });
  };

  const triggerShakeAnimation = () => {
    translateX.value = withSequence(
      withTiming(-4, { duration: 80 }),
      withTiming(4, { duration: 80 }),
      withTiming(-3, { duration: 80 }),
      withTiming(3, { duration: 80 }),
      withTiming(-2, { duration: 80 }),
      withTiming(2, { duration: 80 }),
      withTiming(0, { duration: 80 }),
    );
  };

  const inputProps = {
    inputRef,
    otpValue,
    onPress,
    onFocusNext,
    onFocusPrevious,
    setFocus,
    setOtpValue,
    focus,

    containerStyle,
    otpInputStyle,
    textStyle,
    focusedColor,
    otpCount,
    editable,
    enteringAnimated,
    exitingAnimated,
    error,
    rest,
    inputBorderRadius,
    inputWidth,
    inputHeight,
  };

  useEffect(() => {
    onInputChange && onInputChange(otpValue?.join(""));
    if (
      otpValue &&
      Number(otpValue.join("").length === otpCount) &&
      onInputFinished
    ) {
      if (!error) {
        triggerCompleteAnimation();
      }
      onInputFinished(otpValue.join(""));
    }
  }, [otpValue]);

  useEffect(() => {
    if (error) {
      triggerShakeAnimation();
    }
  }, [error]);

  return (
    <OtpContext.Provider value={inputProps as OtpContextProps}>
      <Animated.View style={[styles.container]}>
        <Animated.View style={[styles.row, animatedContainerStyle]}>
          {data.map((_, i) => {
            return <OtpItem key={i} index={i} />;
          })}
        </Animated.View>
        {error && errorMessage && (
          <Animated.Text
            entering={FadeInDown.duration(200)}
            exiting={FadeOutDown.duration(200)}
            style={styles.errorMessage}
          >
            {errorMessage}
          </Animated.Text>
        )}
      </Animated.View>
    </OtpContext.Provider>
  );
};
