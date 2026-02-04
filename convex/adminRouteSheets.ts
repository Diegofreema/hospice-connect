import { paginationOptsValidator } from 'convex/server';
import { ConvexError, v } from 'convex/values';
import { mutation, query } from './_generated/server';
import {
  getSuspendedNursesCount,
  getUnApprovedSubmittedRouteSheetCount,
  getUnSubmittedRouteSheetCount,
  handleApproveNurseCount,
  handleSuspendedNurseCount,
} from './counter';
import { getUserHelperFn } from './helper';

// Get unsubmitted route sheets (for a nurse or all)

// Get overdue route sheets (not submitted past due date)

export const suspendNurseFromShifts = mutation({
  args: {
    nurseId: v.id('nurses'),
  },
  handler: async (ctx, args) => {
    const user = await getUserHelperFn(ctx);
    if (user?.role !== 'admin' && user?.role !== 'super_admin') {
      throw new ConvexError({
        message: 'Only admin and super admin can access this data',
      });
    }

    const nurse = await ctx.db.get(args.nurseId);
    if (!nurse) {
      throw new ConvexError({
        message: 'Nurse not found',
      });
    }
    if (nurse.status !== 'approved') {
      throw new ConvexError({
        message: 'Nurse must be approved before suspension',
      });
    }
    await ctx.db.patch(args.nurseId, {
      status: 'suspended',
    });
    await handleSuspendedNurseCount(ctx, 'inc');
    await handleApproveNurseCount(ctx, 'dec');
    await ctx.db.insert('nurseNotifications', {
      nurseId: args.nurseId,
      title: 'Account Suspended',
      description:
        'Please submit your outstanding Route Sheet(s) to reactivate your account',
      type: 'normal',
      viewCount: 0,
      isRead: false,
    });
  },
});

export const reactivateNurse = mutation({
  args: {
    nurseId: v.id('nurses'),
  },
  handler: async (ctx, args) => {
    const user = await getUserHelperFn(ctx);
    if (user?.role !== 'admin' && user?.role !== 'super_admin') {
      throw new ConvexError({
        message: 'Only admin and super admin can access this data',
      });
    }

    const nurse = await ctx.db.get(args.nurseId);
    if (!nurse) {
      throw new ConvexError({
        message: 'Nurse not found',
      });
    }
    if (nurse.status !== 'suspended') {
      throw new ConvexError({
        message: 'Nurse must be suspended before reactivation',
      });
    }
    await ctx.db.patch(args.nurseId, {
      status: 'approved',
    });
    await handleSuspendedNurseCount(ctx, 'dec');
    await handleApproveNurseCount(ctx, 'inc');
    await ctx.db.insert('nurseNotifications', {
      nurseId: args.nurseId,
      title: 'Account Reactivated',
      description: 'Your account has been reactivated',
      type: 'normal',
      viewCount: 0,
      isRead: false,
    });
  },
});

export const notifyHospice = mutation({
  args: {
    hospice: v.id('hospices'),
  },
  handler: async (ctx, args) => {
    const user = await getUserHelperFn(ctx);
    if (user?.role !== 'admin' && user?.role !== 'super_admin') {
      throw new ConvexError({
        message: 'Only admin and super admin can access this data',
      });
    }

    const hospice = await ctx.db.get(args.hospice);
    if (!hospice) {
      throw new ConvexError({
        message: 'Hospice not found',
      });
    }

    await ctx.db.insert('hospiceNotifications', {
      hospiceId: args.hospice,
      title: 'Unapproved Route Sheets',
      description:
        'You have unapproved route sheet(s). Please kindly approve them ASAP',
      type: 'admin',
      viewCount: 0,
      isRead: false,
    });
  },
});

export const getSuspendedNurses = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const user = await getUserHelperFn(ctx);
    if (user?.role !== 'admin' && user?.role !== 'super_admin') {
      throw new ConvexError({
        message: 'Only admin and super admin can access this data',
      });
    }

    const suspendedNurses = await ctx.db
      .query('nurses')
      .withIndex('by_status', (q) => q.eq('status', 'suspended'))
      .paginate(args.paginationOpts);
    return suspendedNurses;
  },
});
export const getUnSubmittedRouteSheets = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const user = await getUserHelperFn(ctx);
    if (user?.role !== 'admin' && user?.role !== 'super_admin') {
      throw new ConvexError({
        message: 'Only admin and super admin can access this data',
      });
    }

    const completedAndNotSubmittedAssignments = await ctx.db
      .query('nurseAssignments')
      .filter((q) =>
        q.and(
          q.eq(q.field('isCompleted'), true),
          q.neq(q.field('isSubmitted'), false),
        ),
      )
      .paginate(args.paginationOpts);

    const completedAndNotSubmittedAssignmentsWithNurses =
      completedAndNotSubmittedAssignments.page.map(async (c) => {
        const nurse = await ctx.db.get('nurses', c.nurseId);
        if (!nurse) {
          throw new ConvexError({
            message: 'Nurse not found',
          });
        }
        return {
          ...c,
          nurse,
        };
      });

    return {
      ...completedAndNotSubmittedAssignments,
      page: await Promise.all(completedAndNotSubmittedAssignmentsWithNurses),
    };
  },
});
export const getUnApprovedSubmittedRouteSheets = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const user = await getUserHelperFn(ctx);
    if (user?.role !== 'admin' && user?.role !== 'super_admin') {
      throw new ConvexError({
        message: 'Only admin and super admin can access this data',
      });
    }

    const unApprovedRouteSheets = await ctx.db
      .query('routeSheets')
      .withIndex('approved', (q) => q.eq('isApproved', false))
      .paginate(args.paginationOpts);

    const unApprovedRouteSheetsWithNursesAndHospices =
      unApprovedRouteSheets.page.map(async (c) => {
        const [nurse, hospice] = await Promise.all([
          ctx.db.get('nurses', c.nurseId),
          await ctx.db.get('hospices', c.hospiceId),
        ]);
        if (!nurse || !hospice) {
          throw new ConvexError({
            message: 'Data not found',
          });
        }
        return {
          ...c,
          nurse,
          hospice,
        };
      });

    return {
      ...unApprovedRouteSheets,
      page: await Promise.all(unApprovedRouteSheetsWithNursesAndHospices),
    };
  },
});

export const getRouteSheetStats = query({
  args: {},
  handler: async (ctx) => {
    const user = await getUserHelperFn(ctx);
    if (user?.role !== 'admin' && user?.role !== 'super_admin') {
      throw new ConvexError({
        message: 'Only admin and super admin can access this data',
      });
    }

    const suspendedNursesCount = await getSuspendedNursesCount(ctx);

    const unSubmittedRouteSheetsCount =
      await getUnSubmittedRouteSheetCount(ctx);
    const unApprovedSubmittedRouteSheetsCount =
      await getUnApprovedSubmittedRouteSheetCount(ctx);
    return {
      suspendedNursesCount,
      unSubmittedRouteSheetsCount,
      unApprovedSubmittedRouteSheetsCount,
    };
  },
});
