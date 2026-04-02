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
      .withIndex('userId', (q) => q.eq('userId', identity.subject))
      .first();
    if (!user) return;
    await pushNotifications.recordToken(ctx, {
      userId: user._id,
      pushToken: args.token,
    });
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
