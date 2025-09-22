import { useAuth } from '@/components/context/auth';
import { useAppChatContext } from '@/components/context/chat-context';
import { Wrapper } from '@/features/shared/components/wrapper';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Channel as ChannelType } from 'stream-chat';
import { ChannelList } from 'stream-chat-expo';

const MessageScreen = () => {
  const { user } = useAuth();
  const router = useRouter();
  const { setChannel } = useAppChatContext();
  const id = user?._id!;
  const filters = useMemo(
    () => ({
      members: { $in: [id] },
      type: 'messaging',
    }),
    [id]
  );
  const sort = { last_updated: -1 } as any;
  const options = {
    state: true,
    watch: true,
  };
  const onPress = (channel: ChannelType) => {
    setChannel(channel);
    router.push(`/channel/${channel.cid}`);
  };

  return (
    <Wrapper>
      <ChannelList
        filters={filters}
        options={options}
        sort={sort}
        onSelect={onPress}
        numberOfSkeletons={20}
      />
    </Wrapper>
  );
};

export default MessageScreen;
