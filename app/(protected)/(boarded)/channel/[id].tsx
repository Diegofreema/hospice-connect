import { useAppChatContext } from "@/components/context/chat-context";
import { ChatHeader } from "@/features/shared/components/chat-header";
import { CustomPressable } from "@/features/shared/components/custom-pressable";
import { LoadingComponent } from "@/features/shared/components/loading";
import { Text } from "@/features/shared/components/text";
import { View } from "@/features/shared/components/view";
import { Wrapper } from "@/features/shared/components/wrapper";
import { useHeaderHeight } from "@react-navigation/elements";
import { IconSend } from "@tabler/icons-react-native";
import React from "react";
import { Platform, StatusBar } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import {
  Channel,
  MessageInput,
  MessageList,
  SendButtonProps,
  useMessageInputContext,
} from "stream-chat-expo";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";

const ChannelScreen = () => {
  const { channel } = useAppChatContext();
  const headerHeight = useHeaderHeight() + (StatusBar.currentHeight ?? 0);

  if (!channel) {
    return <LoadingComponent />;
  }

  return (
    <View backgroundColor="white">
      <Channel
        channel={channel}
        hasCameraPicker={false}
        hasCommands={false}
        hasFilePicker={false}
        SendButton={SendButton}
        EmptyStateIndicator={EmptyStateIndicator}
        LoadingErrorIndicator={() => (
          <Text>Error loading messages for this chat</Text>
        )}
        MessageError={() => <Text>Error loading messages for this chat</Text>}
      >
        <View flex={1}>
          <ChatHeader channel={channel} />
          <MessageList />
          <KeyboardAvoidingView
            behavior={"translate-with-padding"}
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
    justifyContent: "center",
    alignItems: "center",
  },
  input: {},
}));
