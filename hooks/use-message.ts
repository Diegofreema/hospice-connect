import { useAuth } from '@/components/context/auth';
import { useAppChatContext } from '@/components/context/chat-context';
import { Id } from '@/convex/_generated/dataModel';
import { router } from 'expo-router';
import { useChatContext } from 'stream-chat-expo';
type Props = {
  userToChat: Id<'users'>;
};
export const useMessage = ({ userToChat }: Props) => {
  const { user } = useAuth();
  const { setChannel } = useAppChatContext();
  const { client } = useChatContext();
  const onMessage = async () => {
    if (!user) return;
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
