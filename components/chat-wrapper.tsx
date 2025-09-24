import { chatApiKey } from '@/chat-config';
import { LoadingComponent } from '@/features/shared/components/loading';
import { PropsWithChildren, useEffect, useState } from 'react';
import { StreamChat } from 'stream-chat';
import { Chat, OverlayProvider } from 'stream-chat-expo';
import { useAuth } from './context/auth';
const client = StreamChat.getInstance(chatApiKey as string);
export const ChatWrapper = ({ children }: PropsWithChildren) => {
  const { user } = useAuth();

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    /**
     * Connect the current user to Stream Chat using their ID and token
     */
    const connectUser = async () => {
      await client.connectUser(
        {
          id: user._id!,
          name: user.name!,
          image: user.image!,
        },
        user?.streamToken
      );
      setIsReady(true);
    };

    connectUser();

    // Cleanup function to disconnect user when component unmounts
    // or when authentication state changes
    return () => {
      if (isReady) {
        client.disconnectUser();
      }
      setIsReady(false);
    };
  }, [user, isReady]);
  // const chatClient = useCreateChatClient({
  //   apiKey: chatApiKey,
  //   userData: {
  //     id: id!,
  //     name: name,
  //     image: image || '',
  //   },
  //   tokenOrProvider: token,
  // });
  console.log({ isClient: !!client });

  if (!client) {
    return <LoadingComponent />;
  }

  return (
    <OverlayProvider>
      <Chat client={client}>{children}</Chat>
    </OverlayProvider>
  );
};
