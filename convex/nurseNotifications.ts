import { paginationOptsValidator } from 'convex/server';
import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { getHospiceAndImage } from './hospices';

export const getNurseNotifications = query({
  args: {
    nurseId: v.id('nurses'),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { nurseId, paginationOpts }) => {
    const notifications = await ctx.db
      .query('nurseNotifications')
      .filter((q) => q.eq(q.field('nurseId'), nurseId))
      .order('desc')
      .paginate(paginationOpts);
    const notificationsWithHospice = notifications.page.map(
      async (notification) => {
        const hospice = await getHospiceAndImage(ctx, notification.hospiceId);
        return {
          ...notification,
          hospice,
        };
      }
    );
    return {
      ...notifications,
      page: await Promise.all(notificationsWithHospice),
    };
  },
});

export const unreadMessagesCount = query({
  args: {
    nurseId: v.id('nurses'),
  },
  handler: async (ctx, { nurseId }) => {
    const notifications = await ctx.db
      .query('nurseNotifications')
      .withIndex('by_nurseId', (q) =>
        q.eq('nurseId', nurseId).eq('isRead', false)
      )
      .collect();

    return notifications.length;
  },
});

// ? mutations
export const markNotificationAsRead = mutation({
  args: {
    nurseId: v.id('nurses'),
  },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query('nurseNotifications')
      .withIndex('by_nurseId', (q) =>
        q.eq('nurseId', args.nurseId).eq('isRead', false)
      )
      .take(100);

    for (const notification of notifications) {
      await ctx.db.patch(notification._id, { isRead: true });
    }
  },
});
