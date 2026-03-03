import { useAuth } from '@/components/context/auth';
import { useAppChatContext } from '@/components/context/chat-context';
import { router } from 'expo-router';
import { useChatContext } from 'stream-chat-expo';

type Props = {
  userToChat: string;
};

export const useMessage = ({ userToChat }: Props) => {
  const { user } = useAuth();
  const { setChannel } = useAppChatContext();

  // Try to get the chat client, but don't crash if Chat context isn't available
  let client;
  try {
    const context = useChatContext();
    client = context?.client;
  } catch {
    // Chat context not available, that's okay
    client = null;
  }

  const onMessage = async () => {
    if (!user || !client) return;

    const channel = client.channel('messaging', {
      members: [user?.id, userToChat],
    });

    await channel.watch({ presence: true });
    setChannel(channel);
    router.push(`/channel/${channel.cid}`);
  };

  return {
    onMessage,
  };
};
