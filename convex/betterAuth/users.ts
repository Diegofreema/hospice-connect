import { doc } from 'convex-helpers/validators';
import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import schema from './schema';

// Example of an in-component function
// Feel free to edit, omit, etc.
export const getUser = query({
  args: { userId: v.id('user') },
  returns: v.union(v.null(), doc(schema, 'user')),
  handler: async (ctx, args) => {
    return ctx.db.get(args.userId);
  },
});
export const deleteUserById = mutation({
  args: { userId: v.id('user') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.userId);
  },
});

export const getUsers = query({
  returns: v.array(doc(schema, 'user')),
  handler: (ctx) => {
    return ctx.db.query('user').collect();
  },
});
