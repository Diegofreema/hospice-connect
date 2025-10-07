import { PropsWithChildren } from 'react';
import {
  StyleProp,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
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
      activeOpacity={0.6}
      {...props}
    >
      {children}
    </TouchableOpacity>
  );
};
