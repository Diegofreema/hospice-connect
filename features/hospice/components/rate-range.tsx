import { Text } from '@/features/shared/components/text';
import { getFontSize } from '@/features/shared/utils';
import { View } from '../../shared/components/view';

import BottomSheetKeyboardAwareScrollView from '@/features/shared/components/bottom-sheet-aware-scroll-view';
import { FlexButtons } from '@/features/shared/components/flex-buttons';
import { Dispatch, SetStateAction, useState } from 'react';
import { TextInput } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

type Props = {
  setRange: Dispatch<
    SetStateAction<{
      rate1: string;
      rate2: string;
    }>
  >;
  range: {
    rate1: string;
    rate2: string;
  };
};

export const RateRange = ({ setRange, range }: Props) => {
  const [rate1, setRate1] = useState('5');
  const [rate2, setRate2] = useState('1000');
  const [isFocused, setIsFocused] = useState(false);
  const [isFocused2, setIsFocused2] = useState(false);

  const onReset = () => {
    setRange({
      rate1: '5',
      rate2: '1000',
    });
    setRate1('5');
    setRate2('1000');
  };

  const onApply = () => {
    setRange({
      rate1,
      rate2,
    });
  };

  return (
    <BottomSheetKeyboardAwareScrollView>
      <View gap={'md'} flex={1}>
        <View
          gap={'sm'}
          backgroundColor={'cardBackground'}
          borderRadius={'lg'}
          p={'md'}
        >
          <Text size={'normal'} fontSize={getFontSize(16)}>
            Price Range
          </Text>
          <View
            gap={'lg'}
            flexDirection="row"
            alignItems="center"
            justifyContent={'flex-start'}
          >
            <TextInput
              value={rate1.toString()}
              keyboardType="numeric"
              onChangeText={(value) => setRate1(value)}
              style={[styles.textInput, isFocused && styles.active]}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Min rate"
            />
            <TextInput
              value={rate2.toString()}
              keyboardType="numeric"
              onChangeText={(value) => setRate2(value)}
              style={[styles.textInput, isFocused2 && styles.active]}
              onFocus={() => setIsFocused2(true)}
              onBlur={() => setIsFocused2(false)}
              placeholder="Max rate"
            />
          </View>
        </View>

        <FlexButtons
          buttonText2="Apply"
          onCancel={onReset}
          onPress={onApply}
          buttonText="Reset"
        />
      </View>
    </BottomSheetKeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create((theme) => ({
  textInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    minHeight: 45,
    borderWidth: 1,
    borderColor: theme.colors.grey,
    flex: 1,
  },
  active: {
    borderColor: theme.colors.blue,
  },
}));
