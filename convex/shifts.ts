import { getAuthUserId } from '@convex-dev/auth/server';
import { v } from 'convex/values';
import { query } from './_generated/server';
import { getNurseDetails } from './nurses';

export const getShifts = query({
  args: {
    assignmentId: v.id('assignments'),
    hospiceId: v.id('hospices'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const assignment = await ctx.db.get(args.assignmentId);
    if (!assignment) {
      return [];
    }

    if (assignment.hospiceId !== args.hospiceId) {
      return [];
    }

    const schedules = await ctx.db
      .query('schedules')
      .withIndex('by_assignment_id', (q) =>
        q.eq('assignmentId', args.assignmentId)
      )
      .collect();

    const shifts = schedules.map(async (schedule) => {
      const nurse = await getNurseDetails(ctx, schedule.nurseId);
      return {
        ...schedule,
        nurse,
      };
    });
    return await Promise.all(shifts);
  },
});
