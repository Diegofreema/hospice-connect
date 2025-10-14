import { getAuthUserId } from '@convex-dev/auth/server';
import { ConvexError, v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const nurseSubmittedRouteSheet = query({
  args: {
    nurseId: v.id('nurses'),
    assignmentId: v.id('assignments'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return false;
    }

    const nurse = await ctx.db.get(args.nurseId);
    if (!nurse) {
      return false;
    }

    const assignment = await ctx.db.get(args.assignmentId);
    if (!assignment) {
      return false;
    }

    const schedules = await ctx.db
      .query('schedules')
      .withIndex('by_assignment_id', (q) =>
        q
          .eq('assignmentId', assignment._id)
          .eq('status', 'completed')
          .eq('nurseId', nurse._id)
      )
      .collect();

    return schedules.every((schedule) => schedule.isSubmitted);
  },
});

export const getDetailsForRouteSheet = query({
  args: {
    nurseId: v.id('nurses'),
    assignmentId: v.id('assignments'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError({ message: 'Unauthorized' });
    }

    const nurse = await ctx.db.get(args.nurseId);
    if (!nurse) {
      throw new ConvexError({ message: 'Nurse not found' });
    }

    const assignment = await ctx.db.get(args.assignmentId);
    if (!assignment) {
      throw new ConvexError({ message: 'Assignment not found' });
    }

    const hospice = await ctx.db.get(assignment.hospiceId);
    if (!hospice) {
      throw new ConvexError({ message: 'Hospice not found' });
    }

    const schedules = await ctx.db
      .query('schedules')
      .withIndex('by_assignment_id', (q) =>
        q
          .eq('assignmentId', assignment._id)
          .eq('status', 'completed')
          .eq('nurseId', nurse._id)
          .eq('isSubmitted', false)
      )
      .collect();

    return {
      nurse,
      assignment: {
        ...assignment,
        businessName: hospice.businessName,
        hospiceAddress: hospice.address,
      },
      schedules,
    };
  },
});
export const getRouteSheet = query({
  args: {
    nurseId: v.id('nurses'),
    assignmentId: v.id('assignments'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError({ message: 'Unauthorized' });
    }

    const nurse = await ctx.db.get(args.nurseId);
    if (!nurse) {
      throw new ConvexError({ message: 'Nurse not found' });
    }

    const assignment = await ctx.db.get(args.assignmentId);
    if (!assignment) {
      throw new ConvexError({ message: 'Assignment not found' });
    }

    const hospice = await ctx.db.get(assignment.hospiceId);
    if (!hospice) {
      throw new ConvexError({ message: 'Hospice not found' });
    }

    const routeSheet = await ctx.db
      .query('routeSheets')
      .withIndex('by_assignment_id', (q) =>
        q.eq('assignmentId', assignment._id).eq('nurseId', nurse._id)
      )
      .first();
    if (!routeSheet) {
      throw new ConvexError({ message: 'Route sheet not found' });
    }
    const schedules = await Promise.all(
      routeSheet.scheduleIds.map((scheduleId) => ctx.db.get(scheduleId))
    );
    const schedulesNotNull = schedules.filter((schedule) => schedule !== null);
    return {
      nurse,
      assignment: {
        ...assignment,
        businessName: hospice.businessName,
        hospiceAddress: hospice.address,
      },
      schedules: schedulesNotNull,
      routeSheet,
    };
  },
});
export const getRouteSheetById = query({
  args: {
    routeSheetId: v.id('routeSheets'),
    hospiceId: v.id('hospices'),
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

    const routeSheet = await ctx.db.get(args.routeSheetId);
    if (!routeSheet) {
      throw new ConvexError({ message: 'Route sheet not found' });
    }

    if (routeSheet.hospiceId !== hospice._id) {
      throw new ConvexError({ message: 'Unauthorized' });
    }
    const nurse = await ctx.db.get(routeSheet.nurseId);
    if (!nurse) {
      throw new ConvexError({ message: 'Nurse not found' });
    }
    const assignment = await ctx.db.get(routeSheet.assignmentId);
    if (!assignment) {
      throw new ConvexError({ message: 'Assignment not found' });
    }
    const schedules = await Promise.all(
      routeSheet.scheduleIds.map((scheduleId) => ctx.db.get(scheduleId))
    );
    const schedulesNotNull = schedules.filter((schedule) => schedule !== null);
    return {
      nurse,
      assignment: {
        ...assignment,
        businessName: hospice.businessName,
        hospiceAddress: hospice.address,
      },
      schedules: schedulesNotNull,
      routeSheet,
    };
  },
});

// mutations
export const submitRouteSheet = mutation({
  args: {
    nurseId: v.id('nurses'),
    hospiceId: v.id('hospices'),
    assignmentId: v.id('assignments'),
    scheduleIds: v.array(v.id('schedules')),
    signature: v.string(),
    comment: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError({ message: 'Unauthorized' });
    }

    const nurse = await ctx.db.get(args.nurseId);
    if (!nurse) {
      throw new ConvexError({ message: 'Nurse not found' });
    }

    const assignment = await ctx.db.get(args.assignmentId);
    if (!assignment) {
      throw new ConvexError({ message: 'Assignment not found' });
    }

    const hospice = await ctx.db.get(args.hospiceId);
    if (!hospice) {
      throw new ConvexError({ message: 'Hospice not found' });
    }

    for (const scheduleId of args.scheduleIds) {
      const schedule = await ctx.db.get(scheduleId);
      if (!schedule) {
        throw new ConvexError({ message: 'Schedule not found' });
      }
      if (schedule.nurseId !== nurse._id) {
        throw new ConvexError({
          message: 'Schedule does not belong to a nurse',
        });
      }
      if (schedule.assignmentId !== assignment._id) {
        throw new ConvexError({
          message: 'Schedule does not belong this assignment',
        });
      }

      await ctx.db.patch(scheduleId, { isSubmitted: true });
    }
    const routeSheetId = await ctx.db.insert('routeSheets', {
      ...args,
      isApproved: false,
    });
    await ctx.db.insert('hospiceNotifications', {
      hospiceId: args.hospiceId,
      isRead: false,
      nurseId: args.nurseId,
      title: `${nurse.firstName} ${nurse.lastName} submitted a route sheet`,
      description: '',
      type: 'route_sheet',
      routeSheetId,
    });
  },
});

export const approveOrDeclineRouteSheet = mutation({
  args: {
    routeSheetId: v.id('routeSheets'),
    isApproved: v.boolean(),
    hospiceId: v.id('hospices'),
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

    const routeSheet = await ctx.db.get(args.routeSheetId);
    if (!routeSheet) {
      throw new ConvexError({ message: 'Route sheet not found' });
    }

    if (routeSheet.hospiceId !== hospice._id) {
      throw new ConvexError({ message: 'Unauthorized' });
    }

    await ctx.db.patch(args.routeSheetId, { isApproved: args.isApproved });
    await ctx.db.insert('nurseNotifications', {
      isRead: false,
      nurseId: routeSheet.nurseId,
      title: args.isApproved ? 'Route sheet approved' : 'Route sheet declined',
      description: `${hospice.businessName} ${args.isApproved ? 'approved' : 'declined'} your route sheet`,
      type: 'normal',
      hospiceId: hospice._id,
    });
  },
});
