import { ConvexError, v } from 'convex/values';
import { internalMutation, mutation, query } from './_generated/server';
import {
  handleUnApprovedSubmittedRouteSheets,
  handleUnSubmittedRouteSheetsCount,
  updateCount,
} from './counter';
import { sendPushNotificationHelper } from './helper';

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
      .withIndex('nurse_id', (q) =>
        q.eq('nurseId', nurse._id).eq('assignmentId', assignment._id),
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

    if (!args.scheduleIds.length) {
      throw new ConvexError({
        message: 'No shift was added to the route sheet',
      });
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
    const notificationId = await ctx.db.insert('hospiceNotifications', {
      hospiceId: args.hospiceId,
      isRead: false,
      nurseId: args.nurseId,
      title: `${nurse.name} (${nurse.discipline})`,
      description: 'Submitted a route sheet, Click to view to accept/decline',
      type: 'route_sheet',
      routeSheetId,
      viewCount: 0,
    });
    await sendPushNotificationHelper({
      ctx,
      title: `${nurse.name} (${nurse.discipline})`,
      body: 'Submitted a route sheet, Click to view',
      userId: hospice.userId,
      data: {
        type: 'hospice_route_sheet_notification',
        routeSheetId,
        notificationId,
      },
    });
  },
});

export const updateRouteSheetStatus = internalMutation({
  handler: async (ctx) => {
    await updateCount(ctx);
  },
});

export const updateHospiceNotificationStatus = internalMutation({
  args: {
    notificationId: v.id('hospiceNotifications'),
    status: v.union(v.literal('accepted'), v.literal('declined')),
  },
  handler: async (ctx, args) => {
    const notification = await ctx.db.get(
      'hospiceNotifications',
      args.notificationId,
    );
    if (!notification) return;

    await ctx.db.patch(args.notificationId, {
      status: args.status,
    });
  },
});
