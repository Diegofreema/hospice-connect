import { chatApiKey } from '@/chat-config';
import { LoadingComponent } from '@/features/shared/components/loading';
import { useUnread } from '@/features/shared/hooks/use-unread';
import { authClient } from '@/lib/auth-client';
import { PropsWithChildren, useEffect } from 'react';
import { Chat, OverlayProvider, useCreateChatClient } from 'stream-chat-expo';
import { useAuth } from './context/auth';
// const client = StreamChat.getInstance(chatApiKey as string);
export const ChatWrapper = ({ children }: PropsWithChildren) => {
  const { user } = useAuth();
  const userData = {
    id: user?.id!,
    name: user?.name!,
    image: user?.image!,
  };
  console.log('userData', userData, user?.streamToken, user?.email);

  const setUnreadCount = useUnread((state) => state.setUnread);
  // const [isReady, setIsReady] = useState(false);
  const chatClient = useCreateChatClient({
    apiKey: chatApiKey,
    userData,
    tokenOrProvider: user?.streamToken,
  });
  useEffect(() => {
    if (chatClient && user?.id) {
      const onFetchUnreadCount = async () => {
        const response = await chatClient.getUnreadCount(user?.id);
        setUnreadCount(response.total_unread_count);
      };
      void onFetchUnreadCount();
    }
  }, [chatClient, user?.id, setUnreadCount]);
  useEffect(() => {
    const listener = chatClient?.on((e) => {
      if (e.total_unread_count !== undefined) {
        setUnreadCount(e.total_unread_count);
      }
    });

    return () => {
      if (listener) {
        listener.unsubscribe();
      }
    };
  }, [chatClient, setUnreadCount]);
  useEffect(() => {
    if (!user?.streamToken) {
      const onLogout = async () => {
        await authClient.signOut();
      };
      onLogout();
    }
  }, [user?.streamToken]);
  console.log('before chat client', chatClient);

  if (!chatClient) {
    return <LoadingComponent />;
  }
  console.log('after chat client', chatClient);

  const chatTheme = {
    channelPreview: {
      container: {
        backgroundColor: 'transparent',
      },
    },
  };

  return (
    <OverlayProvider value={{ style: chatTheme }}>
      <Chat client={chatClient}>{children}</Chat>
    </OverlayProvider>
  );
};
