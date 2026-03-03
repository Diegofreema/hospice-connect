import { chatApiKey } from '@/chat-config';
import { useUnread } from '@/features/shared/hooks/use-unread';
import axios from 'axios';
import { type PropsWithChildren, useCallback, useEffect } from 'react';
import { Chat, OverlayProvider, useCreateChatClient } from 'stream-chat-expo';
import { useAuth } from './context/auth';
// const client = StreamChat.getInstance(chatApiKey as string);
export const ChatWrapper = ({ children }: PropsWithChildren) => {
  const { user } = useAuth();
  const tokenProvider = useCallback(async () => {
    const { data: response } = await axios.post(
      `https://hospice-connect-web.vercel.app/api/token`,
      {
        name: user?.name,
        email: user?.email,
        id: user?.id,
      },
    );

    return response.token;
  }, [user]);

  const setUnreadCount = useUnread((state) => state.setUnread);

  const client = useCreateChatClient({
    apiKey: chatApiKey as string,
    userData: {
      id: user?.id as string,
      name: user?.name,
      image: user?.image ?? undefined,
    },
    tokenOrProvider: tokenProvider,
  });

  useEffect(() => {
    if (client && user?.id) {
      const onFetchUnreadCount = async () => {
        try {
          const response = await client.getUnreadCount(user.id);
          setUnreadCount(response.total_unread_count);
        } catch (err) {
          console.log('getUnreadCount error', err);
        }
      };
      void onFetchUnreadCount();
    }
  }, [user?.id, setUnreadCount, client]);
  useEffect(() => {
    const listener = client?.on((e) => {
      if (e.total_unread_count !== undefined) {
        setUnreadCount(e.total_unread_count);
      }
    });

    return () => {
      if (listener) {
        listener.unsubscribe();
      }
    };
  }, [setUnreadCount, client]);

  const chatTheme = {
    channelPreview: {
      container: {
        backgroundColor: 'transparent',
      },
    },
  };

  if (!client) {
    return null;
  }

  return (
    <OverlayProvider value={{ style: chatTheme }}>
      <Chat client={client}>{children}</Chat>
    </OverlayProvider>
  );
};
