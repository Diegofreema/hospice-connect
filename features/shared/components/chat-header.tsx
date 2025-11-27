import { Avatar } from '@/components/avatar/Avatar';
import { useAuth } from '@/components/context/auth';
import { IconArrowLeft } from '@tabler/icons-react-native';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Channel as ChannelType } from 'stream-chat';
import { CustomPressable } from './custom-pressable';
type Props = {
  channel: ChannelType;
};

export const ChatHeader = ({ channel }: Props) => {
  const { user } = useAuth();
  const { theme } = useUnistyles();
  const otherMember = Object.values(channel.state.members).find(
    (member) => member.user?.id !== user?.id
  );
  const image = otherMember?.user?.image;
  return (
    <CustomPressable style={styles.header} onPress={() => router.back()}>
      <IconArrowLeft size={30} color={theme.colors.black} />
      <Avatar
        image={{ uri: image || '', name: otherMember?.user?.name }}
        size={50}
      />
    </CustomPressable>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
    paddingHorizontal: 5,
  },
});
