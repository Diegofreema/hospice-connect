import { filter } from 'convex-helpers/server/filter';
import { paginationOptsValidator } from 'convex/server';
import { ConvexError, v } from 'convex/values';
import { mutation, query } from './_generated/server';
import {
  getApproveNurseCount,
  getNurseCount,
  getPendingNurseApprovalCount,
  getRejectedNurseCount,
  getSuspendedNursesCount,
  handleApproveNurseCount,
  handlePendingNurseApprovalCount,
  handleRejectedNurseCount,
  handleSuspendedNurseCount,
} from './counter';
import { getUserHelperFn } from './helper';

// Get all nurses
export const getNurses = query({
  args: {
    paginationOpts: paginationOptsValidator,
    state: v.optional(v.string()),
    status: v.union(
      v.literal('pending'),
      v.literal('approved'),
      v.literal('rejected'),
      v.literal('suspended'),
      v.literal('all'),
    ),
    searchQuery: v.optional(v.string()),
    discipline: v.union(
      v.literal('RN'),
      v.literal('LVN'),
      v.literal('HHA'),
      v.literal('all'),
    ),
  },
  handler: async (ctx, args) => {
    const user = await getUserHelperFn(ctx);
    if (user?.role !== 'admin' && user?.role !== 'super_admin') {
      throw new ConvexError({
        message: 'Only admin and super admin can access this data',
      });
    }

    const normalizedSearch = args.searchQuery?.trim().toLowerCase() ?? '';

    const nurses = await filter(ctx.db.query('nurses'), (nurse) => {
      const matchesSearch =
        !normalizedSearch ||
        nurse.name.toLowerCase().includes(normalizedSearch) ||
        nurse.email.toLowerCase().includes(normalizedSearch);

      // Discipline
      const matchesDiscipline =
        args.discipline === 'all' || nurse.discipline === args.discipline;

      // State
      const matchesState =
        args.state === 'all' || nurse.stateOfRegistration === args.state;

      // Status
      const matchesStatus =
        args.status === 'all' || nurse.status === args.status;

      return (
        matchesSearch && matchesDiscipline && matchesState && matchesStatus
      );
    }).paginate(args.paginationOpts);

    return nurses;
  },
});

// Get nurses with filters

// Get pending nurse profiles
export const getPendingNurseProfiles = query({
  handler: async (ctx) => {},
});

// Approve nurse
export const approveNurse = mutation({
  args: { pendingProfileId: v.id('nurses') },
  handler: async (ctx, args) => {
    const user = await getUserHelperFn(ctx);
    if (user?.role !== 'admin' && user?.role !== 'super_admin') {
      throw new ConvexError({
        message: 'Only admin and super admin can access this data',
      });
    }
    const nurse = await ctx.db.get('nurses', args.pendingProfileId);
    if (!nurse) {
      throw new ConvexError({
        message: 'Nurse not found',
      });
    }

    // If nurse was previously rejected, decrease rejected count
    if (nurse.status === 'rejected') {
      await handleRejectedNurseCount(ctx, 'dec');
    }

    await ctx.db.patch(args.pendingProfileId, {
      status: 'approved',
      rejectedReason: undefined,
    });
    await handlePendingNurseApprovalCount(ctx, 'dec');
    await handleApproveNurseCount(ctx, 'inc');
  },
});

// Reject nurse
export const rejectNurse = mutation({
  args: { pendingProfileId: v.id('nurses'), rejectedReason: v.string() },
  handler: async (ctx, args) => {
    const user = await getUserHelperFn(ctx);
    if (user?.role !== 'admin' && user?.role !== 'super_admin') {
      throw new ConvexError({
        message: 'Only admin and super admin can access this data',
      });
    }

    const nurse = await ctx.db.get('nurses', args.pendingProfileId);
    if (!nurse) {
      throw new ConvexError({
        message: 'Nurse not found',
      });
    }
    await ctx.db.patch(args.pendingProfileId, {
      status: 'rejected',
      rejectedReason: args.rejectedReason,
    });
    await ctx.db.insert('nurseNotifications', {
      viewCount: 0,
      isRead: false,
      title: 'Account Rejected',
      type: 'admin',
      description: args.rejectedReason,
      nurseId: nurse._id,
    });
    await handlePendingNurseApprovalCount(ctx, 'dec');
    await handleRejectedNurseCount(ctx, 'inc');
  },
});

// Suspend nurse
export const suspendNurse = mutation({
  args: { nurseId: v.id('nurses'), isSuspended: v.boolean() },
  handler: async (ctx, args) => {
    const user = await getUserHelperFn(ctx);
    if (user?.role !== 'admin' && user?.role !== 'super_admin') {
      throw new ConvexError({
        message: 'Only admin and super admin can access this data',
      });
    }
    const nurse = await ctx.db.get('nurses', args.nurseId);
    if (!nurse) {
      throw new ConvexError({
        message: 'Nurse not found',
      });
    }
    await ctx.db.patch(args.nurseId, {
      status: args.isSuspended ? 'suspended' : 'approved',
    });
    await handleSuspendedNurseCount(ctx, args.isSuspended ? 'inc' : 'dec');
    await handleApproveNurseCount(ctx, args.isSuspended ? 'dec' : 'inc');
    await ctx.db.insert('nurseNotifications', {
      nurseId: args.nurseId,
      title: args.isSuspended ? 'Account Suspended' : 'Account Restored',
      description: args.isSuspended
        ? 'Your account has been suspended'
        : 'Your account has been restored',
      type: 'admin',
      isRead: false,
      viewCount: 0,
    });
  },
});

// Get nurse statistics
export const getNurseStats = query({
  handler: async (ctx) => {
    const user = await getUserHelperFn(ctx);
    if (user?.role !== 'admin' && user?.role !== 'super_admin') {
      throw new ConvexError({
        message: 'Only admin and super admin can access this data',
      });
    }

    return {
      totalNurses: await getNurseCount(ctx),
      pendingNurses: await getPendingNurseApprovalCount(ctx),
      approvedNurses: await getApproveNurseCount(ctx),
      rejectedNurses: await getRejectedNurseCount(ctx),
      suspendedNurses: await getSuspendedNursesCount(ctx),
    };
  },
});

export const getNurse = query({
  args: { nurseId: v.id('nurses') },
  handler: async (ctx, args) => {
    const user = await getUserHelperFn(ctx);
    if (user?.role !== 'admin' && user?.role !== 'super_admin') {
      throw new ConvexError({
        message: 'Only admin and super admin can access this data',
      });
    }
    const nurse = await ctx.db.get('nurses', args.nurseId);
    if (!nurse) {
      throw new ConvexError({
        message: 'Nurse not found',
      });
    }
    return nurse;
  },
});
