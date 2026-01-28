import { paginationOptsValidator } from 'convex/server';
import { query, mutation } from './_generated/server';
import { ConvexError, v } from 'convex/values';
import { getUserById, getUserHelperFn } from './helper';
import { filter } from 'convex-helpers/server/filter';
import { type Id as BetterAuthId } from './betterAuth/_generated/dataModel';
import { type Id } from './_generated/dataModel';
// Send notification to nurse
export const sendNurseNotification = mutation({
  args: {
    nurseId: v.id('nurses'),
    title: v.string(),
    message: v.string(),
    type: v.union(
      v.literal('assignment'),
      v.literal('approval'),
      v.literal('custom'),
    ),
  },
  handler: async (ctx, args) => {},
});

// Send notification to hospice
export const sendHospiceNotification = mutation({
  args: {
    hospiceId: v.id('hospices'),
    title: v.string(),
    message: v.string(),
    type: v.union(
      v.literal('assignment'),
      v.literal('approval'),
      v.literal('system'),
      v.literal('custom'),
    ),
  },
  handler: async (ctx, args) => {
    const user = await getUserHelperFn(ctx);
    if (user?.role !== 'admin' && user?.role !== 'super_admin') {
      throw new ConvexError({
        message: 'Only admin and super admin can access this data',
      });
    }
  },
});

// Get all nurse notifications (for admin view)
export const getAllNurseNotifications = query({
  handler: async (ctx) => {
    const notifications = await ctx.db
      .query('nurseNotifications')
      .order('desc')
      .take(100);

    const notificationsWithNurse = await Promise.all(
      notifications.map(async (notification) => {
        const nurse = await ctx.db.get(notification.nurseId);
        return {
          ...notification,
          nurse,
        };
      }),
    );

    return notificationsWithNurse;
  },
});

// Get all hospice notifications (for admin view)
export const getAllHospiceNotifications = query({
  handler: async (ctx) => {
    const notifications = await ctx.db
      .query('hospiceNotifications')
      .order('desc')
      .take(100);

    const notificationsWithHospice = await Promise.all(
      notifications.map(async (notification) => {
        const hospice = await ctx.db.get(notification.hospiceId);
        return {
          ...notification,
          hospice,
        };
      }),
    );

    return notificationsWithHospice;
  },
});

export const getAdminNotifications = query({
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

    const notifications = await filter(
      ctx.db.query('adminNotifications'),
      (adminNotification) => {
        if (args.isRead === 'all') return true;
        if (args.isRead === 'unread') return !adminNotification.isRead;
        return adminNotification.isRead;
      },
    ).paginate(args.paginationOpts);

    const notificationsWithReceiver = await Promise.all(
      notifications.page.map(async (notification) => {
        const sender = await getUserById(
          ctx,
          notification.sentBy as BetterAuthId<'user'>,
        );
        if (!sender) {
          throw new ConvexError({
            message: 'Sender not found',
          });
        }
        return {
          ...notification,
          email: sender?.email,
          name: sender?.name,
        };
      }),
    );
    return {
      ...notifications,
      page: notificationsWithReceiver,
    };
  },
});

// Delete admin notification
export const deleteAdminNotification = mutation({
  args: {
    messageId: v.id('adminNotifications'),
  },
  handler: async (ctx, args) => {
    // Delete the message and all its recipients
    const user = await getUserHelperFn(ctx);
    if (user?.role !== 'admin' && user?.role !== 'super_admin') {
      throw new ConvexError({
        message: 'Only admin and super admin can access this data',
      });
    }
  },
});

// Get notification details with full info
export const getNotificationDetails = query({
  args: {
    messageId: v.id('adminNotifications'),
  },
  handler: async (ctx, args) => {
    const user = await getUserHelperFn(ctx);
    if (user?.role !== 'admin' && user?.role !== 'super_admin') {
      throw new ConvexError({
        message: 'Only admin and super admin can access this data',
      });
    }
    const notification = await ctx.db.get('adminNotifications', args.messageId);
    if (!notification) {
      throw new ConvexError({
        message: 'Notification not found',
      });
    }
    const notificationSender = await getUserById(
      ctx,
      notification.sentBy as BetterAuthId<'user'>,
    );

    if (!notificationSender) {
      throw new ConvexError({
        message: 'Notification sender not found',
      });
    }
    return {
      ...notification,
      sender: notificationSender,
    };
  },
});

export const sendTargetedMessage = mutation({
  args: {
    senderId: v.id('users'),
    messageType: v.union(
      v.literal('notification'),
      v.literal('news_alert'),
      v.literal('announcement'),
    ),
    title: v.string(),
    content: v.string(),
    targetType: v.union(
      v.literal('all_nurses'),
      v.literal('all_hospices'),
      v.literal('by_discipline'),
      v.literal('by_state'),
    ),
    targetFilters: v.optional(v.any()),
    recipientIds: v.optional(v.array(v.id('users'))),
    isScheduled: v.boolean(),
    scheduledFor: v.optional(v.number()),
  },
  handler: async (ctx, args) => {},
});

export const sendNotifications = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    targetType: v.union(v.literal('nurse'), v.literal('hospice')),
    recipientIds: v.array(v.union(v.id('nurses'), v.id('hospices'))),
  },
  handler: async (ctx, args) => {
    const user = await getUserHelperFn(ctx);

    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      throw new ConvexError({
        message: 'Only admin and super admin can send notifications',
      });
    }

    const { title, description, targetType, recipientIds } = args;

    // Create admin notification record for history
    const adminNotificationId = await ctx.db.insert('adminNotifications', {
      title,
      description,
      type: targetType,
      viewCount: 0,
      isRead: true, // Auto-read by sender
      sentBy: user._id,
    });

    if (targetType === 'nurse') {
      await Promise.all(
        recipientIds.map(async (id) => {
          await ctx.db.insert('nurseNotifications', {
            nurseId: id as Id<'nurses'>,
            title,
            description,
            type: 'admin',
            isRead: false,
            viewCount: 0,
          });
        }),
      );
    } else if (targetType === 'hospice') {
      await Promise.all(
        recipientIds.map(async (id) => {
          await ctx.db.insert('hospiceNotifications', {
            hospiceId: id as Id<'hospices'>,
            title,
            description,
            type: 'admin',
            isRead: false,
            viewCount: 0,
          });
        }),
      );
    }

    return adminNotificationId;
  },
});
