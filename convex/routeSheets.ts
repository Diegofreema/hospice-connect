import { ConvexError, v } from 'convex/values';
import { internal } from './_generated/api';
import { internalMutation, mutation, query } from './_generated/server';
import {
  handleApproveNurseCount,
  handleSuspendedNurseCount,
  handleUnApprovedSubmittedRouteSheets,
  handleUnSubmittedRouteSheetsCount,
  updateCount,
} from './counter';
import { checkDurationOfNotSubmittedAssignment } from './helper';

export const nurseSubmittedRouteSheet = query({
  args: {
    nurseId: v.id('nurses'),
    assignmentId: v.id('assignments'),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
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
      .withIndex('nurse_id', (q) =>
        q.eq('nurseId', nurse._id).eq('assignmentId', assignment._id),
      )
      .filter((q) =>
        q.or(
          q.eq(q.field('status'), 'cancelled'),
          q.eq(q.field('status'), 'completed'),
          q.eq(q.field('status'), 'ended'),
        ),
      )
      .collect();
    if (schedules.length === 0) {
      return false;
    }

    return schedules.every((schedule) => schedule.isSubmitted);
  },
});

export const getDetailsForRouteSheet = query({
  args: {
    nurseId: v.id('nurses'),
    assignmentId: v.id('assignments'),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
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
      .withIndex(
        'nurse_id',
        (q) => q.eq('nurseId', nurse._id).eq('assignmentId', assignment._id),
        // .eq('status', 'completed')
        // .eq('isSubmitted', false)
      )
      .filter((q) =>
        q.and(
          q.eq(q.field('isSubmitted'), false),
          q.or(
            q.eq(q.field('status'), 'cancelled'),
            q.eq(q.field('status'), 'completed'),
            q.eq(q.field('status'), 'ended'),
          ),
        ),
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
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
        q.eq('assignmentId', assignment._id).eq('nurseId', nurse._id),
      )
      .filter((q) => q.eq(q.field('status'), 'approved'))
      .first();
    if (!routeSheet) {
      throw new ConvexError({ message: 'Route sheet not found' });
    }
    const schedules = await Promise.all(
      routeSheet.scheduleIds.map((scheduleId) => ctx.db.get(scheduleId)),
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
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
      routeSheet.scheduleIds.map((scheduleId) => ctx.db.get(scheduleId)),
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
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

    const nurseAssignment = await ctx.db
      .query('nurseAssignments')
      .withIndex('assignmentId', (q) =>
        q.eq('assignmentId', assignment._id).eq('nurseId', nurse._id),
      )
      .first();
    if (!nurseAssignment) {
      throw new ConvexError({
        message: 'Healthcare professional assignment not found',
      });
    }

    await ctx.db.patch('nurseAssignments', nurseAssignment._id, {
      isSubmitted: true,
    });

    await handleUnSubmittedRouteSheetsCount(ctx, 'dec');
    await handleUnApprovedSubmittedRouteSheets(ctx, 'inc');

    const routeSheetId = await ctx.db.insert('routeSheets', {
      ...args,
      status: 'pending',
    });
    await ctx.db.insert('hospiceNotifications', {
      hospiceId: args.hospiceId,
      isRead: false,
      nurseId: args.nurseId,
      title: `${nurse.name} (${nurse.discipline})`,
      description: 'Submitted a route sheet, Click to view to accept/decline',
      type: 'route_sheet',
      routeSheetId,
      viewCount: 0,
    });
  },
});



export const updateRouteSheetStatus = internalMutation({
  handler: async (ctx) => {
    await updateCount(ctx);
  },
});
