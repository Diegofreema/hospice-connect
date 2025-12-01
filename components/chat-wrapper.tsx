import { chatApiKey } from '@/chat-config';
import { SmallLoader } from '@/features/shared/components/small-loader';
import { useUnread } from '@/features/shared/hooks/use-unread';
import axios from 'axios';
import { PropsWithChildren, useCallback, useEffect } from 'react';
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
      }
    );

    return response.token;
  }, [user]);
  // useEffect(() => {
  //   // Skip if user is not authenticated
  //   if (!user?.id || !user?.name || !user?.streamToken) {
  //     return;
  //   }

  //   /**
  //    * Connect the current user to Stream Chat using their ID and token
  //    */
  //   const connectUser = async () => {
  //     try {
  //       await client.connectUser(
  //         {
  //           id: user.id,
  //           name: user.name,
  //         },
  //         user.streamToken
  //       );
  //       setIsReady(true);
  //     } catch (err) {
  //       const { data: response } = await axios.post(
  //         `https://hospice-connect-web.vercel.app/api/token`,
  //         {
  //           name: user?.name,
  //           email: user?.email,
  //           id: user?.id,
  //         }
  //       );

  //       await authClient.updateUser({
  //         streamToken: response.token,
  //       });
  //       console.log('connectUser error', err);
  //     }
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
  // }, [user?.id, user?.name, user?.streamToken, isReady, user?.email]);
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

  if (!client) {
    return <SmallLoader size={50} />;
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
      <Chat client={client}>{children}</Chat>
    </OverlayProvider>
  );
};
