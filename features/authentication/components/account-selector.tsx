import { Card } from '@/features/shared/components/card';
import Text from '@/features/shared/components/text';
import View from '@/features/shared/components/view';
import { getFontSize } from '@/features/shared/utils';
import Checkbox from 'expo-checkbox';
import React from 'react';
import { StyleSheet } from 'react-native';

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
        <Card
          flexDirection={'row'}
          gap={'s'}
          alignItems={'center'}
          key={accountType.type}
          variant={'transparent'}
        >
          <Checkbox
            value={accountType.type === selected}
            onValueChange={() => setSelected(accountType.type)}
            style={styles.checkBox}
          />
          <Text variant={'subheader'} fontSize={getFontSize(20)}>
            {accountType.text}
          </Text>
        </Card>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  checkBox: {
    borderRadius: 100,
  },
});
