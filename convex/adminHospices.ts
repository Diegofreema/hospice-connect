import { filter } from 'convex-helpers/server/filter';
import { paginationOptsValidator } from 'convex/server';
import { ConvexError, v } from 'convex/values';
import { mutation, query } from './_generated/server';
import {
  getApproveHospiceCount,
  getHospiceCount,
  getPendingHospiceApprovalCount,
  getRejectedHospiceCount,
  getSuspendedHospicesCount,
  handleApproveHospiceCount,
  handlePendingHospiceApprovalCount,
  handleRejectedHospiceCount,
  handleSuspendedHospiceCount,
} from './counter';
import { getUserHelperFn, sendPushNotificationHelper } from './helper';

// Get all hospices
export const getHospices = query({
  args: {
    paginationOpts: paginationOptsValidator,
    status: v.union(
      v.literal('pending'),
      v.literal('approved'),
      v.literal('rejected'),
      v.literal('suspended'),
      v.literal('all'),
    ),
    state: v.optional(v.string()),
    searchQuery: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getUserHelperFn(ctx);
    if (user?.role !== 'admin' && user?.role !== 'super_admin') {
      throw new ConvexError({
        message: 'Only admin and super admin can access this data',
      });
    }

    const normalizedSearch = args.searchQuery?.trim().toLowerCase() ?? '';

    const hospices = await filter(ctx.db.query('hospices'), (hospice) => {
      const matchesSearch =
        !normalizedSearch ||
        hospice.businessName.toLowerCase().includes(normalizedSearch) ||
        hospice.email.toLowerCase().includes(normalizedSearch);
      const matchesState = args.state === 'all' || hospice.state === args.state;

      // Status
      const matchesStatus =
        args.status === 'all' || hospice.status === args.status;
      return matchesSearch && matchesState && matchesStatus;
    }).paginate(args.paginationOpts);
    return hospices;
  },
});

// Get pending hospice profiles

// Approve hospice
export const approveHospice = mutation({
  args: { pendingProfileId: v.id('hospices') },
  handler: async (ctx, args) => {
    const user = await getUserHelperFn(ctx);
    if (user?.role !== 'admin' && user?.role !== 'super_admin') {
      throw new ConvexError({
        message: 'Only admin and super admin can access this data',
      });
    }
    const hospice = await ctx.db.get('hospices', args.pendingProfileId);
    if (!hospice) {
      throw new ConvexError({
        message: 'Hospice not found',
      });
    }

    // If hospice was previously rejected, decrease rejected count
    if (hospice.status === 'rejected') {
      await handleRejectedHospiceCount(ctx, 'dec');
    }

    await ctx.db.patch(args.pendingProfileId, {
      status: 'approved',
      rejectedReason: undefined,
    });
    await handlePendingHospiceApprovalCount(ctx, 'dec');
    await handleApproveHospiceCount(ctx, 'inc');
  },
});

// Reject hospice
export const rejectHospice = mutation({
  args: { pendingProfileId: v.id('hospices'), rejectedReason: v.string() },
  handler: async (ctx, args) => {
    const user = await getUserHelperFn(ctx);
    if (user?.role !== 'admin' && user?.role !== 'super_admin') {
      throw new ConvexError({
        message: 'Only admin and super admin can access this data',
      });
    }
    const hospice = await ctx.db.get('hospices', args.pendingProfileId);
    if (!hospice) {
      throw new ConvexError({
        message: 'Hospice not found',
      });
    }
    await ctx.db.patch(args.pendingProfileId, {
      status: 'rejected',
      rejectedReason: args.rejectedReason,
    });

    await ctx.db.insert('hospiceNotifications', {
      viewCount: 0,
      isRead: false,
      title: 'Account rejected',
      type: 'admin',
      hospiceId: hospice._id,
      description: args.rejectedReason,
    });
    await sendPushNotificationHelper({
      ctx,
      body: args.rejectedReason,
      title: 'Account rejected',
      userId: hospice.userId,
      data: {
        type: 'normal',
      },
    });
    await handlePendingHospiceApprovalCount(ctx, 'dec');
    await handleRejectedHospiceCount(ctx, 'inc');
  },
});

// Suspend hospice
export const suspendHospice = mutation({
  args: { hospiceId: v.id('hospices'), isSuspended: v.boolean() },
  handler: async (ctx, args) => {
    const user = await getUserHelperFn(ctx);
    if (user?.role !== 'admin' && user?.role !== 'super_admin') {
      throw new ConvexError({
        message: 'Only admin and super admin can access this data',
      });
    }
    const hospice = await ctx.db.get('hospices', args.hospiceId);
    if (!hospice) {
      throw new ConvexError({
        message: 'Hospice not found',
      });
    }
    const status = args.isSuspended ? 'suspended' : 'approved';
    await ctx.db.patch(args.hospiceId, {
      status,
    });
    if (status === 'suspended') {
      await handleApproveHospiceCount(ctx, 'dec');
      await handleSuspendedHospiceCount(ctx, 'inc');
      const body = 'Your hospice account has been suspended';
      await ctx.db.insert('hospiceNotifications', {
        viewCount: 0,
        isRead: false,
        title: 'Account suspended',
        type: 'admin',
        hospiceId: hospice._id,
        description: body,
      });
      await sendPushNotificationHelper({
        ctx,
        body,
        title: 'Account suspended',
        userId: hospice.userId,
        data: {
          type: 'normal',
        },
      });
    } else {
      await handleApproveHospiceCount(ctx, 'inc');
      await handleSuspendedHospiceCount(ctx, 'dec');
      const body = 'Your hospice account has been reactivated';
      await ctx.db.insert('hospiceNotifications', {
        viewCount: 0,
        isRead: false,
        title: 'Account reactivated',
        type: 'admin',
        hospiceId: hospice._id,
        description: body,
      });
      await sendPushNotificationHelper({
        ctx,
        body,
        title: 'Account reactivated',
        userId: hospice.userId,
        data: {
          type: 'normal',
        },
      });
    }
  },
});

// Get hospice statistics
export const getHospiceStats = query({
  handler: async (ctx) => {
    const user = await getUserHelperFn(ctx);
    if (user?.role !== 'admin' && user?.role !== 'super_admin') {
      throw new ConvexError({
        message: 'Only admin and super admin can access this data',
      });
    }

    return {
      totalHospices: await getHospiceCount(ctx),
      pendingHospices: await getPendingHospiceApprovalCount(ctx),
      approvedHospices: await getApproveHospiceCount(ctx),
      rejectedHospices: await getRejectedHospiceCount(ctx),
      suspendedHospices: await getSuspendedHospicesCount(ctx),
    };
  },
});

export const getHospice = query({
  args: { hospiceId: v.id('hospices') },
  handler: async (ctx, args) => {
    const user = await getUserHelperFn(ctx);
    if (user?.role !== 'admin' && user?.role !== 'super_admin') {
      throw new ConvexError({
        message: 'Only admin and super admin can access this data',
      });
    }
    const hospice = await ctx.db.get('hospices', args.hospiceId);
    if (!hospice) {
      throw new ConvexError({
        message: 'Hospice not found',
      });
    }
    return hospice;
  },
});
