import { Avatar } from '@/components/avatar/Avatar';
import { IconArrowLeft } from '@tabler/icons-react-native';
import { router } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { CustomPressable } from './custom-pressable';

type Props = {
  image?: string;
};

export const ChatHeader = ({ image }: Props) => {
  const { theme } = useUnistyles();
  return (
    <View style={styles.header}>
      <CustomPressable onPress={() => router.back()}>
        <IconArrowLeft size={30} color={theme.colors.black} />
      </CustomPressable>
      <Avatar image={{ uri: image || '', name: 'Av' }} size={50} />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
  },
});
