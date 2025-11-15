import { ExtendAssignment } from '@/features/hospice/components/extend-assignment';
import { CustomPressable } from '@/features/shared/components/custom-pressable';
import { Text } from '@/features/shared/components/text';
import { Wrapper } from '@/features/shared/components/wrapper';
import { IconX } from '@tabler/icons-react-native';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native-unistyles';

const ExtendScreen = () => {
  const handlePress = () => {
    router.dismiss();
  };
  return (
    <Wrapper>
      <Text size="large" isBold textAlign="center" style={{ marginTop: 40 }}>
        Extend Assignment
      </Text>
      <CustomPressable onPress={handlePress} style={styles.button}>
        <IconX size={30} />
      </CustomPressable>
      <ExtendAssignment />
    </Wrapper>
  );
};

export default ExtendScreen;

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
});
