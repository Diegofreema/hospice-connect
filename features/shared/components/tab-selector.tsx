import { Picker as ComposePicker } from '@expo/ui/jetpack-compose';
import { Picker } from '@expo/ui/swift-ui';
import { Platform } from 'react-native';
type Props = {
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  items: string[];
};

export const TabSelectorIos = ({
  selectedIndex,
  setSelectedIndex,
  items,
}: Props) => {
  return Platform.OS === 'ios' ? (
    <Picker
      options={items}
      selectedIndex={selectedIndex}
      onOptionSelected={({ nativeEvent: { index } }) => {
        setSelectedIndex(index);
      }}
      variant="segmented"
      color="black"
      style={{ width: '100%' }}
    />
  ) : (
    <ComposePicker
      options={items}
      selectedIndex={selectedIndex}
      onOptionSelected={({ nativeEvent: { index } }) => {
        setSelectedIndex(index);
      }}
      variant="segmented"
      color="black"
      style={{ width: '100%' }}
    />
  );
};
