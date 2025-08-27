import {
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { LinearTransition } from "react-native-reanimated";

export interface IOtpInput {
  otpCount: number;
  containerStyle?: StyleProp<ViewStyle>;
  otpInputStyle?: StyleProp<TextStyle>;
  textStyle?: StyleProp<TextStyle>;
  focusedColor?: string;
  inputWidth?: number;
  inputHeight?: number;
  inputBorderRadius?: number;
  enableAutoFocus?: boolean;
  editable?: boolean;
  onInputFinished?: (code: string) => void;
  onInputChange?: (codes: string) => void;
  enteringAnimated?: typeof LinearTransition;
  exitingAnimated?: typeof LinearTransition;
  error?: boolean;
  errorMessage?: string;
}

export interface OtpContextProps extends IOtpInput {
  inputRef: React.MutableRefObject<any[]>;
  otpValue: string[];
  onPress: () => void;
  onFocusNext: (value: string, index: number) => void;
  onFocusPrevious: (key: string, index: number) => void;
  setFocus: React.Dispatch<React.SetStateAction<number>>;
  setOtpValue: React.Dispatch<React.SetStateAction<string[]>>;
  focus: number;
  autoFocus: boolean;
  currentIndex: number;
  rest?: TextInputProps;
}
