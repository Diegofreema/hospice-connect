import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

// Create activity log
export const createActivityLog = mutation({
  args: {
    userId: v.id('users'),
    action: v.string(),
    description: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('activityLogs', {
      userId: args.userId,
      action: args.action,
      description: args.description,
      metadata: args.metadata,
    });
  },
});

// Get recent activity logs
export const getRecentActivityLogs = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const logs = await ctx.db
      .query('activityLogs')
      .order('desc')
      .take(args.limit || 50);

    // Fetch user details for each log
    const logsWithUsers = await Promise.all(
      logs.map(async (log) => {
        const user = await ctx.db.get(log.userId);
        return {
          ...log,
          user,
        };
      })
    );

    return logsWithUsers;
  },
});

// Get activity logs by user
export const getActivityLogsByUser = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('activityLogs')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .order('desc')
      .collect();
  },
});
