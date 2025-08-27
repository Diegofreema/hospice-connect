import { otpInputStyles as styles } from "../styles";
import React, { FC, useContext, useEffect } from "react";
import { Dimensions, Keyboard, Pressable, TextInput, View } from "react-native";
import Animated, {
  LinearTransition,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { OtpContext } from "../context";

interface OtpItemProps {
  index: number;
}

export const OtpItem: FC<OtpItemProps> = (props: OtpItemProps) => {
  const {
    inputRef,
    onPress,
    otpValue,
    onFocusNext,
    onFocusPrevious,
    setFocus,
    setOtpValue,
    focus,
    autoFocus,
    containerStyle,
    otpInputStyle,
    textStyle,
    otpCount,
    editable,
    enteringAnimated,
    exitingAnimated,
    error,
    rest,
    inputBorderRadius,
    inputHeight,
    inputWidth,
  } = useContext(OtpContext);

  const borderWidth = useSharedValue(focus === props.index ? 2 : 1);
  const borderOpacity = useSharedValue(focus === props.index ? 1 : 0.3);

  useEffect(() => {
    borderWidth.value = withTiming(focus === props.index ? 2 : 1, {
      duration: 200,
    });
    borderOpacity.value = withTiming(focus === props.index ? 1 : 0.3, {
      duration: 200,
    });
  }, [focus]);

  useEffect(() => {
    if (otpValue) {
      if ((otpValue[props.index]?.length ?? 0) > 1) {
        const format = otpValue[props.index]?.substring(0, otpCount);
        const numbers = format?.split("") ?? [];
        setOtpValue(numbers);
        setFocus(-1);
        Keyboard.dismiss();
      }
    }
  }, [otpValue]);

  const getTextStyle = () => {
    if (error) {
      return [styles.text, styles.textError, textStyle];
    }
    return [styles.text, textStyle];
  };

  return (
    <View key={props.index} style={[containerStyle]}>
      <TextInput
        style={[
          styles.inputSize,
          otpInputStyle,
          {
            color: "transparent",
            width: inputWidth,
            height: inputHeight,
            borderRadius: inputBorderRadius,
          },
        ]}
        caretHidden
        keyboardType="number-pad"
        ref={inputRef.current[props.index]}
        value={otpValue[props.index]}
        onChangeText={(v) => onFocusNext(v, props.index)}
        onKeyPress={(e) => onFocusPrevious(e.nativeEvent.key, props.index)}
        textContentType="oneTimeCode"
        autoFocus={autoFocus && props.index === 0}
        {...rest}
      />
      <Pressable disabled={!editable} onPress={onPress} style={styles.overlay}>
        <Animated.View
          layout={LinearTransition.springify()}
          style={[
            styles.input,
            styles.inputSize,
            {
              width: inputWidth,
              height: inputHeight,
              borderRadius: inputBorderRadius,
            },
          ]}
          entering={enteringAnimated}
          exiting={exitingAnimated}
        >
          {otpValue[props.index] !== "" && (
            <Animated.Text
              entering={enteringAnimated}
              exiting={exitingAnimated}
              style={getTextStyle()}
            >
              {otpValue[props.index]}
            </Animated.Text>
          )}
        </Animated.View>
      </Pressable>
    </View>
  );
};
