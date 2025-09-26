import { paginationOptsValidator } from 'convex/server';
import { v } from 'convex/values';
import { query } from './_generated/server';

export const getOurPosts = query({
  args: {
    hospiceId: v.id('hospices'),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('assignments')
      .withIndex('hospiceId', (q) => q.eq('hospiceId', args.hospiceId))
      .order('asc')
      .paginate(args.paginationOpts);
  },
});
