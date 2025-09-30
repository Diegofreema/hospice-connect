import { Button } from '@/features/shared/components/button';

import { Text } from '@/features/shared/components/text';
import { getFontSize } from '@/features/shared/utils';
import { View } from '../../shared/components/view';

import { Dispatch, SetStateAction, useState } from 'react';
import { TextInput } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

type Props = {
  setRange: Dispatch<
    SetStateAction<{
      rate1: number;
      rate2: number;
    }>
  >;
  range: {
    rate1: number;
    rate2: number;
  };
};

export const RateRange = ({ setRange, range }: Props) => {
  const [localRange, setLocalRange] = useState(range);
  const [isFocused, setIsFocused] = useState(false);
  const [isFocused2, setIsFocused2] = useState(false);
  const { theme } = useUnistyles();
  const handleRateChange = (value: string, field: 'rate1' | 'rate2') => {
    setLocalRange((prevRange) => ({
      ...prevRange,
      [field]: parseInt(value),
    }));
  };

  const onReset = () => {
    setRange({
      rate1: 5,
      rate2: 1000,
    });
  };

  const onApply = () => {
    setRange(localRange);
  };

  return (
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
          gap={'sm'}
          flexDirection="row"
          alignItems="center"
          justifyContent={'flex-start'}
          flex={1}
        >
          <TextInput
            value={localRange.rate1.toString()}
            keyboardType="numeric"
            onChangeText={(value) => handleRateChange(value, 'rate1')}
            style={[styles.textInput, isFocused && styles.active]}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Min rate"
          />
          <TextInput
            value={localRange.rate2.toString()}
            keyboardType="numeric"
            onChangeText={(value) => handleRateChange(value, 'rate2')}
            style={[styles.textInput, isFocused2 && styles.active]}
            onFocus={() => setIsFocused2(true)}
            onBlur={() => setIsFocused2(false)}
            placeholder="Max rate"
          />
        </View>
      </View>
      <View gap={'sm'} justifyContent={'flex-start'} flex={1} mt={'lg'}>
        <Button
          title="Reset"
          onPress={onReset}
          bg={'transparent'}
          color={theme.colors.blue}
          style={{ borderWidth: 1, borderColor: theme.colors.blue }}
        />
        <Button title="Apply" onPress={onApply} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  textInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 18,
    paddingHorizontal: 10,
    minHeight: 45,
    flex: 1,
  },
  active: {
    borderWidth: 1,
    borderColor: theme.colors.blue,
  },
}));
