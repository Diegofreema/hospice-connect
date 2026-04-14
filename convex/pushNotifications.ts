import { PushNotifications } from '@convex-dev/expo-push-notifications';
import { v } from 'convex/values';
import { components } from './_generated/api';
import { internalMutation, mutation } from './_generated/server';

const pushNotifications = new PushNotifications(components.pushNotifications);

export const recordPushNotificationToken = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) return;

    const user = await ctx.db
      .query('users')
      .withIndex('userId', (q) =>
        q.eq('userId', identity.subject).eq('email', identity.email),
      )
      .first();

    if (!user) return;

    await pushNotifications.recordToken(ctx, {
      userId: user._id,
      pushToken: args.token,
    });
  },
});

// Internal mutation: removes a push token from all users except currentUserId.
// This ensures a device token is only ever live for one account at a time.
export const removeTokenFromOtherUsers = internalMutation({
  args: {
    token: v.string(),
    currentUserId: v.id('users'),
  },
  handler: async (ctx, args) => {
    // Find all users in our users table except the current one
    const users = await ctx.db
      .query('users')
      .filter((q) => q.neq(q.field('_id'), args.currentUserId))
      .collect();

    for (const u of users) {
      const status = await pushNotifications.getStatusForUser(ctx, {
        userId: u._id,
      });
      // Only call removeToken if they actually have a token registered
      if (status.hasToken) {
        await pushNotifications.removeToken(ctx, { userId: u._id });
      }
    }
  },
});

export const sendPushNotification = internalMutation({
  args: {
    title: v.string(),
    to: v.id('users'),
    body: v.string(),
    data: v.optional(v.record(v.string(), v.string())),
  },
  handler: async (ctx, args) => {
    await pushNotifications.sendPushNotification(ctx, {
      userId: args.to,
      notification: {
        title: args.title,
        body: args.body,
        data: args.data,
      },
    });
  },
});
