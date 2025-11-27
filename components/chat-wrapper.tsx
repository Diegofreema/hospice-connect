import { chatApiKey } from '@/chat-config';
import { LoadingComponent } from '@/features/shared/components/loading';
import { useUnread } from '@/features/shared/hooks/use-unread';
import { authClient } from '@/lib/auth-client';
import { PropsWithChildren, useEffect } from 'react';
import { Chat, OverlayProvider, useCreateChatClient } from 'stream-chat-expo';
import { useAuth } from './context/auth';
import { useToast } from './demos/toast';
// const client = StreamChat.getInstance(chatApiKey as string);
export const ChatWrapper = ({ children }: PropsWithChildren) => {
  const { user } = useAuth();
  const userData = {
    id: user?.id!,
    name: user?.name!,
    image: user?.image!,
  };

  const setUnreadCount = useUnread((state) => state.setUnread);
  // const [isReady, setIsReady] = useState(false);
  const chatClient = useCreateChatClient({
    apiKey: chatApiKey,
    userData,
    tokenOrProvider: user?.streamToken,
  });
  const { showToast } = useToast();
  console.log({ userData, token: user?.streamToken, chatApiKey });

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
        showToast({
          title: 'You have been signed out',
          subtitle: 'Credentials not valid',
        });
      };
      onLogout();
    }
  }, [user?.streamToken, showToast]);
  console.log({ chatClient }, 'before return');
  if (!chatClient) {
    return <LoadingComponent />;
  }
  console.log({ chatClient }, 'after return');

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
