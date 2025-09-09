import { chatApiKey } from '@/chat-config';
import { LoadingComponent } from '@/features/shared/components/loading';
import { PropsWithChildren } from 'react';
import { Chat, OverlayProvider, useCreateChatClient } from 'stream-chat-expo';
import { useAuth } from './context/auth';

export const ChatWrapper = ({ children }: PropsWithChildren) => {
  const { user, token } = useAuth();
  const name = user?.name;
  const email = user?.email;
  const image = user?.image;
  const id = user?._id;
  console.log({ name, email, image, id });

  const chatClient = useCreateChatClient({
    apiKey: chatApiKey,
    userData: {
      id: id!,
      name: name,
      image: image || '',
    },
    tokenOrProvider: token,
  });
  console.log({ chatClient });

  if (!chatClient) {
    return <LoadingComponent />;
  }

  return (
    <OverlayProvider>
      <Chat client={chatClient}>{children}</Chat>
    </OverlayProvider>
  );
};
