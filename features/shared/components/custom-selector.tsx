import { StyleSheet } from 'react-native-unistyles';
import { CustomPressable } from './custom-pressable';

import { Text } from './text';
import { Stack } from './v-stack';

type Props = {
  data: string[];
  selected: string;
  setSelected: (selected: string) => void;
};

export const CustomerSelector = ({ data, selected, setSelected }: Props) => {
  return (
    <Stack isFlexCentered mode="flex" gap={'sm'}>
      {data.map((item) => (
        <CustomPressable
          key={item}
          onPress={() => setSelected(item)}
          style={[
            styles.selector,
            selected === item ? styles.active : styles.normal,
          ]}
        >
          <Text
            size={'small'}
            style={selected === item ? styles.activeText : styles.text}
          >
            {item}
          </Text>
        </CustomPressable>
      ))}
    </Stack>
  );
};

const styles = StyleSheet.create((theme) => ({
  selector: {
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  normal: { backgroundColor: theme.colors.buttonGrey },
  active: {
    backgroundColor: theme.colors.blue,
  },
  text: {
    color: theme.colors.black,
  },
  activeText: {
    color: theme.colors.white,
  },
}));
