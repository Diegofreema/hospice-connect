import { useAppChatContext } from '@/components/context/chat-context';
import { ChatHeader } from '@/features/shared/components/chat-header';
import { CustomPressable } from '@/features/shared/components/custom-pressable';
import { LoadingComponent } from '@/features/shared/components/loading';
import { Text } from '@/features/shared/components/text';
import { View } from '@/features/shared/components/view';
import { Wrapper } from '@/features/shared/components/wrapper';
import { ChannelMemberResponse } from '@/features/shared/types';
import { useHeaderHeight } from '@react-navigation/elements';
import { IconSend } from '@tabler/icons-react-native';
import React, { useEffect } from 'react';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import {
  Channel,
  MessageInput,
  MessageList,
  SendButtonProps,
  useMessageInputContext,
} from 'stream-chat-expo';

const ChannelScreen = () => {
  const { channel } = useAppChatContext();
  const headerHeight = useHeaderHeight();
  const [members, setMembers] = React.useState<ChannelMemberResponse[]>([]);
  useEffect(() => {
    if (!channel) return;
    const getMembers = async () => {
      const c = await channel?.watch({ presence: true });
      setMembers(c?.members);
    };
    getMembers();
  }, [channel]);
  if (!channel) {
    return <LoadingComponent />;
  }
  console.log({ members });

  return (
    <View flex={1} backgroundColor="white">
      {/* <Stack.Screen
        options={{
          title: channel?.data?.name,
          headerRight: () => ,
        }}
      /> */}

      <Channel
        channel={channel}
        keyboardVerticalOffset={headerHeight}
        MessageHeader={() => <Text>Messages</Text>}
        hasCameraPicker={false}
        hasCommands={false}
        hasFilePicker={false}
        SendButton={SendButton}
        EmptyStateIndicator={EmptyStateIndicator}
      >
        <View flex={1}>
          <ChatHeader image={channel?.data?.image} />
          <MessageList />
          <MessageInput />
        </View>
      </Channel>
    </View>
  );
};

export default ChannelScreen;

export const SendButton = (props: SendButtonProps) => {
  const { theme } = useUnistyles();
  const { disabled } = props;
  const { sendMessage } = useMessageInputContext();
  const onPress = () => {
    sendMessage && sendMessage();
  };
  return (
    <CustomPressable style={styles.send} onPress={onPress} disabled={disabled}>
      <IconSend
        size={25}
        fill={theme.colors.white}
        color={theme.colors.white}
      />
    </CustomPressable>
  );
};

const EmptyStateIndicator = () => {
  return (
    <Wrapper>
      <View flex={1} justifyContent="center" alignItems="center">
        <Text>No messages yet</Text>
        <Text>Your messages will be found here!</Text>
      </View>
    </Wrapper>
  );
};
const styles = StyleSheet.create((theme) => ({
  send: {
    backgroundColor: theme.colors.blue,
    padding: 5,
    borderRadius: 30,
    height: 50,
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {},
}));
