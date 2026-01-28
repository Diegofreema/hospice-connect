import type { EasingFunction, TextStyle } from "react-native";
import { type EasingFunctionFactory, type ReduceMotion } from "react-native-reanimated";

export interface StepperValueProps {
  style?: TextStyle;

  animationConfig?: {
    duration?: number;
    reduceMotion?: ReduceMotion;
    easing?: EasingFunction | EasingFunctionFactory;
  };
}
