import { useCallback, useEffect, useRef, useState } from 'react';
import type { Channel as StreamChatChannel } from 'stream-chat';
import { useChatContext } from 'stream-chat-expo';

interface UseStreamChannelOptions {
  id?: string;
  skip?: boolean;
}

export const useStreamChannelQuery = ({
  id,
  skip,
}: UseStreamChannelOptions) => {
  // Safely access the Stream Chat client — the <Chat> provider may not be
  // mounted yet during cold-start notification navigation.
  let client;
  try {
    const context = useChatContext();
    client = context?.client;
  } catch {
    client = null;
  }

  const [channel, setChannel] = useState<StreamChatChannel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const channelRef = useRef<StreamChatChannel | null>(null);
  const fetchInProgress = useRef(false);

  const onFetchChannel = useCallback(async () => {
    try {
      if (!id || !client || fetchInProgress.current) return;
      
      fetchInProgress.current = true;
      setLoading(true);
      setError(false);

      // Parse the id — it could be either a full CID ("messaging:abc123") or a
      // bare channel id ("abc123"). Extract type + id accordingly.
      let channelType = 'messaging';
      let channelId = id;
      if (id.includes(':')) {
        const parts = id.split(':');
        channelType = parts[0];
        channelId = parts.slice(1).join(':');
      }

      // Use client.channel() + watch() instead of queryChannels().
      // This is Stream Chat's recommended pattern for navigating directly to a
      // known channel — it's faster, works with local cache, and doesn't rely
      // on a search/filter round-trip.
      const ch = client.channel(channelType, channelId);
      
      // Prevent hanging on await if another screen/process already initialized it
      if (!ch.initialized) {
        await ch.watch({ state: true, presence: true });
      }

      channelRef.current = ch;
      console.log('Stream Channel fully fetched & watched:', ch.id);

      setChannel(ch);
    } catch (err) {
      console.log('useStreamChannelQuery error:', err);
      setError(true);
    } finally {
      fetchInProgress.current = false;
      setLoading(false);
    }
  }, [client, id]);

  useEffect(() => {
    if (!skip && id && client) {
      onFetchChannel();
    }
  }, [id, client, skip, onFetchChannel]);

  useEffect(() => {
    return () => {
      // Use the ref so we don't trigger re-renders from tracking cleanup
      channelRef.current?.stopWatching();
    };
  }, []); // Empty array guarantees cleanup tracking does not cause loops

  return { channel, loading, retry: onFetchChannel, isError: error };
};
