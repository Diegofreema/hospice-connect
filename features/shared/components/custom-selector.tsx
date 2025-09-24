import { palette } from '@/theme';
import { StyleSheet } from 'react-native';
import { CustomPressable } from './custom-pressable';
import { HStack } from './HStack';
import Text from './text';

type Props = {
  data: string[];
  selected: string;
  setSelected: (selected: string) => void;
};

export const CustomerSelector = ({ data, selected, setSelected }: Props) => {
  return (
    <HStack justifyContent={'flex-start'} gap={'s'}>
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
            variant={'small'}
            style={selected === item ? styles.activeText : styles.text}
          >
            {item}
          </Text>
        </CustomPressable>
      ))}
    </HStack>
  );
};

const styles = StyleSheet.create({
  selector: {
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  normal: { backgroundColor: palette.buttonGrey },
  active: {
    backgroundColor: palette.blue,
  },
  text: {
    color: palette.black,
  },
  activeText: {
    color: palette.white,
  },
});
