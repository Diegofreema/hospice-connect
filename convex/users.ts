import { getAuthUserId } from '@convex-dev/auth/server';
import { MutationCtx, query } from './_generated/server';

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
