import { Text } from '@/features/shared/components/text';
import { View } from '@/features/shared/components/view';

import { Checkbox } from 'expo-checkbox';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

const accountTypes = [
  { type: 'nurse', text: 'Healthcare Professional' },
  { type: 'hospice', text: 'Hospice' },
] as const;
type Props = {
  selected: 'nurse' | 'hospice';
  setSelected: React.Dispatch<React.SetStateAction<'nurse' | 'hospice'>>;
};
export const AccountSelector = ({ selected, setSelected }: Props) => {
  return (
    <View mt={'xl'} gap="md">
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

          <Text size={'large'} isBold>
            {accountType.text}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  checkBox: {
    borderRadius: 100,
  },
  press: {
    borderWidth: 1,
    borderColor: theme.colors.grey,
    paddingHorizontal: 10,
    paddingVertical: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
}));
