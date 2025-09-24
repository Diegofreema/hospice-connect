import { Icon } from '@tabler/icons-react-native';
import { StyleProp, ViewStyle } from 'react-native';
import { CustomPressable } from './custom-pressable';

type Props = {
  icon: Icon;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

export const PressableIcon = ({ icon: Icon, onPress, style }: Props) => {
  return (
    <CustomPressable onPress={onPress} style={style}>
      <Icon size={25} />
    </CustomPressable>
  );
};
