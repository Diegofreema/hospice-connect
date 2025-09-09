import { getAuthUserId } from '@convex-dev/auth/server';
import { v } from 'convex/values';
import { mutation, MutationCtx, query } from './_generated/server';

export const getUser = query({
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }
    return user;
  },
});
export const findUserByEmail = async (ctx: MutationCtx, email: string) => {
  return await ctx.db
    .query('users')
    .withIndex('email', (q) => q.eq('email', email))
    .first();
};

export const updateStreamToken = mutation({
  args: {
    streamToken: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }
    return await ctx.db.patch(user._id, {
      streamToken: args.streamToken,
    });
  },
});
