import { type PropsWithChildren } from 'react';
import {
  type StyleProp,
  TouchableOpacity,
  type TouchableOpacityProps,
  type ViewStyle,
} from 'react-native';

type Props = TouchableOpacityProps & {
  style?: StyleProp<ViewStyle>;
  onPress: () => void;
};

export const CustomPressable = ({
  children,
  style,
  onPress,
  ...props
}: PropsWithChildren<Props>) => {
  return (
    <TouchableOpacity
      style={style}
      onPress={onPress}
      activeOpacity={0.8}
      {...props}
    >
      {children}
    </TouchableOpacity>
  );
};
