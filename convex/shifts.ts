import { getAuthUserId } from '@convex-dev/auth/server';
import { paginationOptsValidator, PaginationResult } from 'convex/server';
import { ConvexError, v } from 'convex/values';
import { Doc } from './_generated/dataModel';
import { query } from './_generated/server';
import { getNurseDetails } from './nurses';

export const getShifts = query({
  args: {
    assignmentId: v.id('assignments'),
    hospiceId: v.id('hospices'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const emptyData = {
      shifts: [],
      assignment: null,
    };
    if (!userId) {
      return emptyData;
    }

    const assignment = await ctx.db.get(args.assignmentId);
    if (!assignment) {
      return emptyData;
    }

    if (assignment.hospiceId !== args.hospiceId) {
      return emptyData;
    }

    const schedules = await ctx.db
      .query('schedules')
      .withIndex('by_assignment_id', (q) =>
        q.eq('assignmentId', args.assignmentId)
      )
      // .order('desc')
      .collect();

    const shifts = schedules.map(async (schedule) => {
      const nurse = await getNurseDetails(ctx, schedule.nurseId);
      return {
        ...schedule,
        nurse,
      };
    });

    return {
      shifts: await Promise.all(shifts),
      assignment,
    };
  },
});
export const getShiftsByOnlyAssignmentId = query({
  args: {
    assignmentId: v.id('assignments'),
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

    const schedules = await ctx.db
      .query('schedules')
      .withIndex('by_assignment_id', (q) =>
        q.eq('assignmentId', args.assignmentId)
      )
      .order('asc')
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
export const getShift = query({
  args: {
    scheduleId: v.id('schedules'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const schedule = await ctx.db.get(args.scheduleId);

    if (!schedule) {
      return null;
    }

    const shiftWithNurse = await getNurseDetails(ctx, schedule.nurseId);

    return {
      ...schedule,
      nurse: shiftWithNurse,
    };
  },
});

export const getInProgressShifts = query({
  args: {
    nurseId: v.id('nurses'),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return {} as PaginationResult<Doc<'assignments'>>;
    }
    // * get schedules
    const schedules = await ctx.db
      .query('schedules')
      .withIndex('nurse', (q) =>
        q.eq('nurseId', args.nurseId).eq('status', 'booked')
      )
      .order('desc')
      .paginate(args.paginationOpts);

    // * get assignments through schedules
    const uniqueAssignmentIds = [
      ...new Set(schedules.page.map((schedule) => schedule.assignmentId)),
    ];
    const assignments = await Promise.all(
      uniqueAssignmentIds.map(async (assignmentId) => {
        const assignment = await ctx.db.get(assignmentId);
        if (!assignment) {
          throw new ConvexError({ message: 'Assignment not found' });
        }
        const hospice = await ctx.db.get(assignment?.hospiceId);

        return {
          ...assignment,
          businessName: hospice?.businessName,
          hospiceUserId: hospice?.userId!,
        };
      })
    );

    return {
      ...schedules,
      page: assignments,
    };
  },
});

// ? mutations
