import { chatApiKey } from '@/chat-config';
import { LoadingComponent } from '@/features/shared/components/loading';
import { PropsWithChildren, useEffect, useState } from 'react';
import { StreamChat } from 'stream-chat';
import { Chat, OverlayProvider } from 'stream-chat-expo';
import { useAuth } from './context/auth';
const client = StreamChat.getInstance(chatApiKey as string);
export const ChatWrapper = ({ children }: PropsWithChildren) => {
  const { user, token } = useAuth();
  const name = user?.name;
  const email = user?.email;
  const image = user?.image;
  const id = user?._id;
  console.log({ name, email, image, id, token });
  // Track whether the chat client is ready (connected)
  const [isReady, setIsReady] = useState(false);
  // Get authentication state from AuthProvider

  // Connect to Stream Chat when the user is authenticated
  useEffect(() => {
    // Skip if user is not authenticated
    if (!user || !token) {
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
        token
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
  }, [user, token, isReady]);
  // const chatClient = useCreateChatClient({
  //   apiKey: chatApiKey,
  //   userData: {
  //     id: id!,
  //     name: name,
  //     image: image || '',
  //   },
  //   tokenOrProvider: token,
  // });

  if (!client) {
    return <LoadingComponent />;
  }

  return (
    <OverlayProvider>
      <Chat client={client}>{children}</Chat>
    </OverlayProvider>
  );
};
