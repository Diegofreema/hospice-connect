/**
 * Stores the channel ID from a notification that was tapped during cold-start
 * (dead state). Because ChatWrapper's conditional <Chat> rendering causes a
 * full React tree remount when the Stream client initialises, any navigation
 * performed *before* the client is ready gets wiped out.
 *
 * Instead of navigating immediately, cold-start handlers store the target
 * channel here. Once the client is ready (inside ChatWrapper), the pending
 * channel is consumed and navigation happens after the tree has stabilised.
 */

let pendingChannelId: string | null = null;

export const setPendingNotificationChannel = (id: string) => {
  pendingChannelId = id;
};

export const consumePendingNotificationChannel = (): string | null => {
  const id = pendingChannelId;
  pendingChannelId = null;
  return id;
};
