import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import type { Channel as StreamChatChannel } from 'stream-chat';
import { useChatContext } from 'stream-chat-expo';

interface UseStreamChannelOptions {
  id?: string;
  skip?: boolean;
}

export const useStreamChannelQuery = ({ id, skip }: UseStreamChannelOptions) => {
  const { client } = useChatContext();

  const query = useQuery({
    queryKey: ['stream-channel', id],
    queryFn: async (): Promise<StreamChatChannel | null> => {
      if (!id || !client) return null;

      const [channel] = await client.queryChannels(
        { type: 'messaging', id },
        {},
        { watch: true, state: true },
      );

      return channel || null;
    },
    enabled: !!id && !!client && !skip,
    staleTime: 0,
    gcTime: 0, // Prevent caching: ensures we re-subscribe correctly on mount
  });

  useEffect(() => {
    const channel = query.data;
    return () => {
      // Stop watching to unsubscribe from real-time events and avoid memory leaks
      channel?.stopWatching();
    };
  }, [query.data]);

  return query;
};
