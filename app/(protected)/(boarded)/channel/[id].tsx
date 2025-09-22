import { useAppChatContext } from '@/components/context/chat-context';
import { LoadingComponent } from '@/features/shared/components/loading';
import { Wrapper } from '@/features/shared/components/wrapper';
import { useHeaderHeight } from '@react-navigation/elements';
import React from 'react';
import { Channel, MessageInput, MessageList } from 'stream-chat-expo';

const ChannelScreen = () => {
  const { channel } = useAppChatContext();
  const headerHeight = useHeaderHeight();
  if (!channel) {
    return <LoadingComponent />;
  }
  return (
    <Wrapper>
      <Channel channel={channel} keyboardVerticalOffset={headerHeight}>
        <MessageList />
        <MessageInput />
      </Channel>
    </Wrapper>
  );
};

export default ChannelScreen;
