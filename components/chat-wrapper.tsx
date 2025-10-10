import { chatApiKey } from '@/chat-config';
import { LoadingComponent } from '@/features/shared/components/loading';
import { useUnread } from '@/features/shared/hooks/use-unread';
import { PropsWithChildren, useEffect } from 'react';
import { Chat, OverlayProvider, useCreateChatClient } from 'stream-chat-expo';
import { useAuth } from './context/auth';
// const client = StreamChat.getInstance(chatApiKey as string);
export const ChatWrapper = ({ children }: PropsWithChildren) => {
  const { user } = useAuth();
  const userData = {
    id: user?._id!,
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
  // useEffect(() => {
  //   if (!user) {
  //     return;
  //   }

  //   /**
  //    * Connect the current user to Stream Chat using their ID and token
  //    */
  //   const connectUser = async () => {
  //     await client.connectUser(
  //       {
  //         id: user._id!,
  //         name: user.name!,
  //         image: user.image!,
  //       },
  //       user?.streamToken
  //     );
  //     setIsReady(true);
  //   };

  //   connectUser();

  //   // Cleanup function to disconnect user when component unmounts
  //   // or when authentication state changes
  //   return () => {
  //     if (isReady) {
  //       client.disconnectUser();
  //     }
  //     setIsReady(false);
  //   };
  // }, [user, isReady]);
  useEffect(() => {
    if (!chatClient || !user?._id) return;
    const fetchUnreadCount = async () => {
      try {
        const response = await chatClient.getUnreadCount(user?._id);
        setUnreadCount(response.total_unread_count);
      } catch (error) {
        console.log({ error });
      }
    };
    fetchUnreadCount();
  }, [chatClient, setUnreadCount, user?._id]);

  if (!chatClient) {
    return <LoadingComponent />;
  }

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
