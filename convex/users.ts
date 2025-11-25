import { v } from 'convex/values';
import {
  internalMutation,
  MutationCtx,
  query,
  QueryCtx,
} from './_generated/server';
import { authComponent } from './auth';

export const getUser = query({
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    const user = await ctx.db
      .query('users')
      .withIndex('email', (q) => q.eq('email', identity.email))
      .first();
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

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return authComponent.getAuthUser(ctx);
  },
});
// export const getForCurrentUser = query({
//   args: {},
//   handler: async (ctx) => {
//     const identity = await ctx.auth.getUserIdentity();
//     if (identity === null) {
//       throw new Error("Not authenticated");
//     }
//     return await ctx.db
//       .query("messages")
//       .filter((q) => q.eq(q.field("author"), identity.email))
//       .collect();
//   },
// });

export const createUser = internalMutation({
  args: {
    streamToken: v.string(),
    user: v.object({
      name: v.string(),
      email: v.string(),
      _id: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('users', {
      role: 'nurse',
      streamToken: args.streamToken,
      name: args.user.name,
      email: args.user.email,
      isBoarded: false,
      userId: args.user._id,
    });
  },
});

// helper functions

export const getUserHelper = async (ctx: QueryCtx, id: string) => {
  return await authComponent.getAnyUserById(ctx, id);
};
