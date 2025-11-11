import { chatApiKey } from "@/chat-config";
import { LoadingComponent } from "@/features/shared/components/loading";
import { useUnread } from "@/features/shared/hooks/use-unread";
import { PropsWithChildren, useEffect } from "react";
import { Chat, OverlayProvider, useCreateChatClient } from "stream-chat-expo";
import { useAuth } from "./context/auth";
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
  useEffect(() => {
    if (chatClient && user?._id) {
      const onFetchUnreadCount = async () => {
        const response = await chatClient.getUnreadCount(user?._id);
        setUnreadCount(response.total_unread_count);
      };
      void onFetchUnreadCount();
    }
  }, [chatClient, user?._id, setUnreadCount]);
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

  if (!chatClient) {
    return <LoadingComponent />;
  }

  const chatTheme = {
    channelPreview: {
      container: {
        backgroundColor: "transparent",
      },
    },
  };

  return (
    <OverlayProvider value={{ style: chatTheme }}>
      <Chat client={chatClient}>{children}</Chat>
    </OverlayProvider>
  );
};
