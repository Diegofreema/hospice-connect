import { filter } from 'convex-helpers/server/filter';
import { paginationOptsValidator } from 'convex/server';
import { ConvexError, v } from 'convex/values';
import { api } from './_generated/api';
import { mutation, query } from './_generated/server';
import { getUserHelperFn } from './helper';

// Get paginated admin activity notifications from user actions
export const getAdminActivityNotifications = query({
  args: {
    paginationOpts: paginationOptsValidator,

    isRead: v.optional(
      v.union(v.literal('all'), v.literal('read'), v.literal('unread')),
    ),
  },
  handler: async (ctx, args) => {
    const user = await getUserHelperFn(ctx);
    if (user?.role !== 'admin' && user?.role !== 'super_admin') {
      throw new ConvexError({
        message: 'Only admin and super admin can access this data',
      });
    }
    // Build query for activity notifications

    const results = await filter(
      ctx.db.query('adminActivityNotifications'),
      (adminActivityNotification) => {
        if (args.isRead && args.isRead !== 'all') {
          return adminActivityNotification.isRead === (args.isRead === 'read');
        }
        return true;
      },
    ).paginate(args.paginationOpts);

    const resultsWithProfile = await Promise.all(
      results.page.map(async (adminActivityNotification) => {
        let relatedEntity = null;
        if (
          adminActivityNotification.type === 'nurse' &&
          adminActivityNotification.nurseId
        ) {
          relatedEntity = await ctx.db.get(
            'nurses',
            adminActivityNotification.nurseId,
          );
        } else if (
          adminActivityNotification.type === 'hospice' &&
          adminActivityNotification.hospiceId
        ) {
          relatedEntity = await ctx.db.get(
            'hospices',
            adminActivityNotification.hospiceId,
          );
        }
        return {
          ...adminActivityNotification,
          relatedEntity,
        };
      }),
    );

    return {
      ...results,
      page: resultsWithProfile,
    };
  },
});

// get admin activity notifications count
export const hasAdminActivityHaveUnreadNotifications = query({
  handler: async (ctx) => {
    const user = await getUserHelperFn(ctx);
    if (user?.role !== 'admin' && user?.role !== 'super_admin') {
      throw new ConvexError({
        message: 'Only admin and super admin can access this data',
      });
    }
    const count = await filter(
      ctx.db.query('adminActivityNotifications'),
      (adminActivityNotification) => !adminActivityNotification.isRead,
    ).take(20);
    return count.length;
  },
});

// Mark activity notification as read
export const markActivityNotificationAsRead = mutation({
  args: {
    notificationId: v.id('adminActivityNotifications'),
  },
  handler: async (ctx, args) => {
    const user = await getUserHelperFn(ctx);
    if (user?.role !== 'admin' && user?.role !== 'super_admin') {
      throw new ConvexError({
        message: 'Only admin and super admin can access this data',
      });
    }
    await ctx.db.patch(args.notificationId, { isRead: true });
    return { success: true };
  },
});

// Mark all activity notifications as read
export const markAllActivityNotificationsAsRead = mutation({
  args: {
    cursor: v.union(v.null(), v.string()),
    numItems: v.number(),
  },
  handler: async (ctx, args) => {
    const data = await filter(
      ctx.db.query('adminActivityNotifications'),
      (notification) => !notification.isRead,
    ).paginate({
      cursor: args.cursor,
      numItems: args.numItems,
    });
    const { page, isDone, continueCursor } = data;

    for (const notification of page) {
      await ctx.db.patch(notification._id, { isRead: true });
    }
    if (!isDone) {
      await ctx.scheduler.runAfter(
        0,
        api.adminActivityNotifications.markAllActivityNotificationsAsRead,
        {
          cursor: continueCursor,
          numItems: args.numItems,
        },
      );
    }
    return { success: true };
  },
});

// Delete activity notification
export const deleteActivityNotification = mutation({
  args: {
    notificationId: v.id('adminActivityNotifications'),
  },
  handler: async (ctx, args) => {
    const user = await getUserHelperFn(ctx);
    if (user?.role !== 'admin' && user?.role !== 'super_admin') {
      throw new ConvexError({
        message: 'Only admin and super admin can access this data',
      });
    }
    await ctx.db.delete(args.notificationId);
    return { success: true };
  },
});

// Create admin activity notification (internal - called when users trigger actions)
export const createActivityNotification = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    type: v.union(v.literal('nurse'), v.literal('hospice')),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('adminActivityNotifications', {
      title: args.title,
      description: args.description,
      isRead: false,
      type: args.type,
    });
  },
});
