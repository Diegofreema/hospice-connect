import { v } from 'convex/values';
import { query } from './_generated/server';

export const unreadMessagesCount = query({
  args: {
    hospiceId: v.id('hospices'),
  },
  handler: async (ctx, { hospiceId }) => {
    const notifications = await ctx.db
      .query('hospiceNotifications')
      .withIndex('by_hospice_id', (q) =>
        q.eq('hospiceId', hospiceId).eq('isRead', false)
      )
      .collect();

    return notifications.length;
  },
});
