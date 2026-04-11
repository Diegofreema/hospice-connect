import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { Platform, StyleProp, ViewStyle } from 'react-native';

type Props = {
  value: Date;
  onChange: (event: DateTimePickerEvent, date?: Date | undefined) => void;
  mode: 'date' | 'time' | 'datetime';
  display?: 'default' | 'spinner' | 'calendar' | 'compact';
  style?: StyleProp<ViewStyle>;
  is24Hour?: boolean;
};

export const CustomDatePicker = ({
  value,
  onChange,
  mode,
  display,
  style,
  is24Hour,
}: Props) => {
  const platformDisplay = Platform.OS === 'ios' ? 'default' : 'spinner';
  return (
    <DateTimePicker
      value={value}
      onChange={onChange}
      mode={mode}
      display={platformDisplay}
      style={[{ marginTop: 20 }, style]}
      is24Hour={is24Hour}
    />
  );
};
