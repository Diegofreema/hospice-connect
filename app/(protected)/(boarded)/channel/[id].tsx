import { useAppChatContext } from '@/components/context/chat-context';
import { DownloadableFileAttachment } from '@/features/messaging/components/chat-attachment-download';
import { ChatHeader } from '@/features/shared/components/chat-header';
import { CustomPressable } from '@/features/shared/components/custom-pressable';
import { SmallLoader } from '@/features/shared/components/small-loader';
import { Text } from '@/features/shared/components/text';
import { View } from '@/features/shared/components/view';
import { Wrapper } from '@/features/shared/components/wrapper';
import { useStreamChannelQuery } from '@/hooks/use-stream-channel';
import { useHeaderHeight } from '@react-navigation/elements';
import { IconSend } from '@tabler/icons-react-native';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StatusBar } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import {
  Channel,
  MessageInput,
  MessageList,
  type SendButtonProps,
  useMessageInputContext,
} from 'stream-chat-expo';
const ChannelScreen = () => {
  const { channel: contextChannel } = useAppChatContext();

  const headerHeight = useHeaderHeight() + (StatusBar.currentHeight ?? 0);
  const { bottom } = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const contextChannelMatchesId =
    contextChannel &&
    id &&
    (contextChannel.cid === id || contextChannel.id === id);

  const {
    channel: channelFromQuery,
    loading: isLoading,
    retry,
    isError,
  } = useStreamChannelQuery({
    id,
    skip: !!contextChannelMatchesId,
  });

  const channelToRender = contextChannelMatchesId
    ? contextChannel
    : channelFromQuery;
  console.log({ isLoading });

  if (isLoading && id) {
    return <SmallLoader size={50} />;
  }

  if (isError || !channelToRender) {
    return (
      <Wrapper>
        <View flex={1} justifyContent="center" alignItems="center" gap="md">
          <Text>Could not load this conversation</Text>
          <CustomPressable onPress={() => retry()}>
            <Text style={{ color: '#2563EB' }}>Tap to retry</Text>
          </CustomPressable>
        </View>
      </Wrapper>
    );
  }

  return (
    <View backgroundColor="white">
      <Channel
        channel={channelToRender}
        hasCameraPicker={false}
        hasCommands={false}
        hasFilePicker={false}
        SendButton={SendButton}
        FileAttachment={DownloadableFileAttachment}
        EmptyStateIndicator={EmptyStateIndicator}
        LoadingErrorIndicator={() => (
          <Text>Error loading messages for this chat</Text>
        )}
        MessageError={() => <Text>Error loading messages for this chat</Text>}
      >
        <View flex={1} style={{ marginBottom: bottom }}>
          <ChatHeader channel={channelToRender} />
          <MessageList />
          <KeyboardAvoidingView
            behavior={'translate-with-padding'}
            keyboardVerticalOffset={headerHeight}
          >
            <MessageInput />
          </KeyboardAvoidingView>
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
