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
      .filter((q) => q.lt(q.field('viewCount'), 1))
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
    const nurse = await ctx.db.get(args.nurseId);
    if (!nurse) {
      return;
    }

    const notifications = await ctx.db
      .query('nurseNotifications')
      .withIndex('by_nurseId', (q) =>
        q.eq('nurseId', nurse._id).eq('isRead', false)
      )
      .collect();
    if (notifications.length === 0) {
      return;
    }
    for (const notification of notifications) {
      if (notification.viewCount > 1) {
        await ctx.db.patch(notification._id, { isRead: true });
      }
    }
  },
});
export const updateViewCount = mutation({
  args: {
    notificationId: v.id('nurseNotifications'),
  },
  handler: async (ctx, args) => {
    try {
      const notification = await ctx.db.get(args.notificationId);
      if (!notification) {
        return;
      }

      if (notification.viewCount > 1) {
        return;
      }

      await ctx.db.patch(notification._id, {
        viewCount: notification.viewCount + 1,
      });
    } catch (error) {
      console.log(error);
    }
  },
});
