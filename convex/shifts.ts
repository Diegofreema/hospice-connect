import { getAuthUserId } from '@convex-dev/auth/server';
import { paginationOptsValidator, PaginationResult } from 'convex/server';
import { ConvexError, v } from 'convex/values';
import { Doc } from './_generated/dataModel';
import { mutation, query } from './_generated/server';
import { getNurseDetails } from './nurses';
import { getSchedulesByAssignmentIdHelper } from './schedules';
import { shifts } from './schema';

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

    const schedules = await getSchedulesByAssignmentIdHelper(
      ctx,
      args.assignmentId
    );

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

    const schedules = await getSchedulesByAssignmentIdHelper(
      ctx,
      args.assignmentId
    );

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
    const nursesNotCompletedAssignments = await ctx.db
      .query('nurseAssignments')
      .withIndex('nurse_id', (q) =>
        q.eq('nurseId', args.nurseId).eq('isCompleted', false)
      )
      .paginate(args.paginationOpts);

    const assignments = await Promise.all(
      nursesNotCompletedAssignments.page.map(async (nurseAssignment) => {
        const assignment = await ctx.db.get(nurseAssignment.assignmentId);
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
      ...nursesNotCompletedAssignments,
      page: assignments,
    };
  },
});

// ? mutations
export const extendAssignment = mutation({
  args: {
    assignmentId: v.id('assignments'),
    hospiceId: v.id('hospices'),
    shifts: v.array(shifts),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError({ message: 'Unauthorized' });
    }

    const hospice = await ctx.db.get(args.hospiceId);
    if (!hospice) {
      throw new ConvexError({ message: 'Hospice not found' });
    }

    const assignment = await ctx.db.get(args.assignmentId);
    if (!assignment) {
      throw new ConvexError({ message: 'Assignment not found' });
    }

    if (assignment.hospiceId !== args.hospiceId) {
      throw new ConvexError({
        message: 'You do not have permission to extend this assignment',
      });
    }

    for (const shift of args.shifts) {
      await ctx.db.insert('schedules', {
        assignmentId: assignment._id,
        endDate: shift.end,
        endTime: shift.endShift,
        startDate: shift.start,
        startTime: shift.startShift,
        rate: assignment.rate,
        status: 'available',
        isSubmitted: false,
      });
    }
    await ctx.db.patch(assignment._id, {
      endDate: args.shifts[args.shifts.length - 1].end,
      status: 'available',
    });
  },
});
