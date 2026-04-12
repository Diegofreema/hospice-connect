import { ConvexError, v } from 'convex/values';
import { components, internal } from './_generated/api';
import { internalMutation, mutation, query } from './_generated/server';
import { getUserHelperFn } from './helper';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

// Request account deletion - creates an audit-trail record and schedules hard delete
export const requestAccountDeletion = mutation({
  args: {
    email: v.string(),
    reason: v.optional(v.string()),
    confirmDeletion: v.boolean(),
  },
  handler: async (ctx, args) => {
    if (!args.confirmDeletion) {
      throw new ConvexError({ message: 'Account deletion must be confirmed' });
    }

    // Verify the user exists
    const user = await getUserHelperFn(ctx);
    if (!user) {
      throw new ConvexError({ message: 'User not found' });
    }

    // Verify email matches
    if (user.email !== args.email) {
      throw new ConvexError({ message: 'Email does not match user account' });
    }

    // Guard: prevent duplicate pending requests
    const existing = await ctx.db
      .query('accountDeletionRequests')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .filter((q) => q.eq(q.field('status'), 'pending'))
      .first();

    if (existing) {
      throw new ConvexError({
        message:
          'A deletion request is already pending for this account. It will be processed within 30 days.',
      });
    }

    // Create deletion request record for audit trail
    const deletionRequestId = await ctx.db.insert('accountDeletionRequests', {
      userId: user._id,
      email: args.email,
      reason: args.reason,
      status: 'pending',
      requestedAt: Date.now(),
    });

    // Also write to the simpler deleteAccount table for quick lookup
    await ctx.db.insert('deleteAccount', {
      userId: user._id,
      reason: args.reason ?? 'No reason provided',
    });

    // Schedule the permanent hard delete 30 days from now
    await ctx.scheduler.runAfter(
      THIRTY_DAYS_MS,
      internal.deleteAccount.hardDeleteUser,
      { userId: user._id, deletionRequestId },
    );

    return {
      success: true,
      message:
        'Account deletion request submitted. Your account will be permanently deleted within 30 days.',
      requestId: deletionRequestId,
    };
  },
});

// Hard delete — runs automatically after 30 days via Convex scheduler
export const hardDeleteUser = internalMutation({
  args: {
    userId: v.string(),
    deletionRequestId: v.id('accountDeletionRequests'),
  },
  handler: async (ctx, { userId, deletionRequestId }) => {
    // 1. Find and delete nurse record
    const nurse = await ctx.db
      .query('nurses')
      .withIndex('userId', (q) => q.eq('userId', userId))
      .first();
    if (nurse) {
      // Anonymize nurseAssignments instead of deleting (preserve assignment history)
      const nurseAssignments = await ctx.db
        .query('nurseAssignments')
        .withIndex('nurse_id', (q) => q.eq('nurseId', nurse._id))
        .collect();
      for (const na of nurseAssignments) {
        await ctx.db.delete(na._id);
      }
      // Delete nurse notifications
      const nurseNotifications = await ctx.db
        .query('nurseNotifications')
        .withIndex('by_nurseId', (q) => q.eq('nurseId', nurse._id))
        .collect();
      for (const n of nurseNotifications) {
        await ctx.db.delete(n._id);
      }
      // Delete availabilities
      const availabilities = await ctx.db
        .query('availabilities')
        .withIndex('nurseId', (q) => q.eq('nurseId', nurse._id))
        .collect();
      for (const a of availabilities) {
        await ctx.db.delete(a._id);
      }
      await ctx.db.delete(nurse._id);
    }

    // 2. Find and delete hospice record
    const hospice = await ctx.db
      .query('hospices')
      .withIndex('userId', (q) => q.eq('userId', userId))
      .first();
    if (hospice) {
      // Delete hospice notifications
      const hospiceNotifications = await ctx.db
        .query('hospiceNotifications')
        .withIndex('by_hospice_id', (q) => q.eq('hospiceId', hospice._id))
        .collect();
      for (const n of hospiceNotifications) {
        await ctx.db.delete(n._id);
      }
      await ctx.db.delete(hospice._id);
    }

    // 3. Delete from deleteAccount quick-lookup table
    const deleteAccountRecords = await ctx.db
      .query('deleteAccount')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .collect();
    for (const r of deleteAccountRecords) {
      await ctx.db.delete(r._id);
    }

    // 4. Mark the audit request as completed
    await ctx.db.patch(deletionRequestId, {
      status: 'completed',
      deletedAt: Date.now(),
    });

    // 5. Delete the main user record from the `users` table
    const userRecord = await ctx.db
      .query('users')
      .withIndex('userId', (q) => q.eq('userId', userId))
      .first();
    if (userRecord) {
      await ctx.db.delete(userRecord._id);
      await ctx.runMutation(components.betterAuth.users.deleteUserById, {
        userId: userRecord.userId,
      });
    }
  },
});

// Check deletion request status
export const checkDeletionStatus = query({
  handler: async (ctx) => {
    const user = await getUserHelperFn(ctx);
    if (!user) {
      throw new ConvexError({ message: 'User not found' });
    }

    const request = await ctx.db
      .query('accountDeletionRequests')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .order('desc')
      .first();

    return request;
  },
});

// Cancel deletion request (if the user changes their mind within 30 days)
export const cancelDeletionRequest = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getUserHelperFn(ctx);
    if (!user) {
      throw new ConvexError({ message: 'User not found' });
    }

    const request = await ctx.db
      .query('accountDeletionRequests')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .order('desc')
      .first();

    if (!request) {
      throw new ConvexError({ message: 'No deletion request found' });
    }

    if (request.status !== 'pending') {
      throw new ConvexError({
        message: 'Can only cancel pending deletion requests',
      });
    }

    await ctx.db.patch(request._id, {
      status: 'cancelled',
    });

    return {
      success: true,
      message: 'Deletion request has been cancelled',
    };
  },
});
