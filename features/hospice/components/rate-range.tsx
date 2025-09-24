import { Button } from '@/features/shared/components/button';
import { HStack } from '@/features/shared/components/HStack';
import Text from '@/features/shared/components/text';
import View from '@/features/shared/components/view';
import { getFontSize } from '@/features/shared/utils';
import { palette } from '@/theme';
import { Dispatch, SetStateAction, useState } from 'react';
import { StyleSheet, TextInput } from 'react-native';

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
    <View gap={'m'} flex={1}>
      <View g={'s'} backgroundColor={'cardBackground'} borderRadius={8} p={'m'}>
        <Text variant={'body'} fontSize={getFontSize(16)}>
          Price Range
        </Text>
        <HStack gap={'s'} justifyContent={'flex-start'} flex={1}>
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
        </HStack>
      </View>
      <HStack gap={'s'} justifyContent={'flex-start'} flex={1} marginTop={'l'}>
        <Button
          label="Reset"
          onPress={onReset}
          backgroundColor={'transparent'}
          color="blue"
          borderWidth={1}
          borderColor="blue"
        />
        <Button label="Apply" onPress={onApply} />
      </HStack>
    </View>
  );
};

const styles = StyleSheet.create({
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
    borderColor: palette.blue,
  },
});
