import Text from '@/features/shared/components/text';
import View from '@/features/shared/components/view';
import { getFontSize } from '@/features/shared/utils';
import { palette } from '@/theme';
import Checkbox from 'expo-checkbox';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

const accountTypes = [
  { type: 'nurse', text: 'Nurse' },
  { type: 'hospice', text: 'Hospice' },
] as const;
type Props = {
  selected: 'nurse' | 'hospice';
  setSelected: React.Dispatch<React.SetStateAction<'nurse' | 'hospice'>>;
};
export const AccountSelector = ({ selected, setSelected }: Props) => {
  return (
    <View marginTop={'l'} gap="m">
      {accountTypes.map((accountType) => (
        <TouchableOpacity
          key={accountType.type}
          style={styles.press}
          onPress={() => setSelected(accountType.type)}
        >
          <Checkbox
            value={accountType.type === selected}
            style={styles.checkBox}
          />

          <Text variant={'subheader'} fontSize={getFontSize(20)}>
            {accountType.text}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  checkBox: {
    borderRadius: 100,
  },
  press: {
    borderWidth: 1,
    borderColor: palette.grey,
    paddingHorizontal: 10,
    paddingVertical: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
});
