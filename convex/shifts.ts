import { filter } from 'convex-helpers/server/filter';
import { paginationOptsValidator, type PaginationResult } from 'convex/server';
import { ConvexError, v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { sendAvailableAssignmentNotificationToNurse } from './helper';
import { getNurseDetails } from './nurses';
import { getSchedulesByAssignmentIdHelper } from './schedules';
import { shifts } from './schema';
import { type InProgressShiftsType } from './types';

export const getShifts = query({
  args: {
    assignmentId: v.id('assignments'),
    hospiceId: v.id('hospices'),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const emptyData = {
      shifts: [],
      assignment: null,
    };
    if (!identity) {
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
      const routeSheet = await filter(
        ctx.db
          .query('routeSheets')
          .withIndex('is_approved', (q) =>
            q.eq('isApproved', true).eq('assignmentId', args.assignmentId)
          ),
        (q) => q.scheduleIds.includes(schedule._id)
      ).first();
      const isRouteSheetApproved = !!routeSheet?.isApproved;
      return {
        ...schedule,
        nurse,
        isRouteSheetApproved,
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return {} as PaginationResult<InProgressShiftsType>;
    }
    // Get all assignments that are not completed
    const nursesNotCompletedAssignments = await ctx.db
      .query('nurseAssignments')
      .filter((q) =>
        q.and(
          q.eq(q.field('nurseId'), args.nurseId),
          q.eq(q.field('isCompleted'), false)
        )
      )
      .order('desc')
      .paginate(args.paginationOpts);

    // Get the assignment details
    const assignments = await Promise.all(
      nursesNotCompletedAssignments.page.map(async (nurseAssignment) => {
        const assignment = await ctx.db.get(nurseAssignment.assignmentId);
        if (!assignment) {
          throw new ConvexError({ message: 'Assignment not found' });
        }
        const hospice = await ctx.db.get(assignment?.hospiceId);
        if (!hospice) {
          throw new ConvexError({ message: 'Hospice not found' });
        }
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
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
    // Send notification to nurses
    await sendAvailableAssignmentNotificationToNurse(
      ctx,
      assignment.discipline,
      assignment.state,
      hospice,
      null,
      500
    );
  },
});
