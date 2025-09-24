import { PropsWithChildren } from 'react';
import { StyleProp, TouchableOpacity, ViewStyle } from 'react-native';

type Props = {
  style?: StyleProp<ViewStyle>;
  onPress: () => void;
};

export const CustomPressable = ({
  children,
  style,
  onPress,
}: PropsWithChildren<Props>) => {
  return (
    <TouchableOpacity style={style} onPress={onPress} activeOpacity={0.6}>
      {children}
    </TouchableOpacity>
  );
};
