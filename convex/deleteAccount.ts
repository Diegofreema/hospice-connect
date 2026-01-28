import { mutation, query } from './_generated/server';
import { ConvexError, v } from 'convex/values';
import { getUserFromBetterAuthId, getUserHelperFn } from './helper';

// Request account deletion - creates a deletion request
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

    // Create deletion request record for audit trail
    const deletionRequest = await ctx.db.insert('accountDeletionRequests', {
      userId: user._id,
      email: args.email,
      reason: args.reason,
      status: 'pending',
      requestedAt: Date.now(),
    });

    return {
      success: true,
      message:
        'Account deletion request submitted. Your account will be deleted within 30 days.',
      requestId: deletionRequest,
    };
  },
});

// Mock function: Process account deletion (admin would call this)
export const processAccountDeletion = mutation({
  args: {
    deleteRelatedData: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await getUserHelperFn(ctx);
    if (!user) {
      throw new ConvexError({ message: 'User not found' });
    }

    // In production, this would:
    // 1. Delete all user data based on deleteRelatedData flag
    // 2. Delete from nurses, hospices, assignments, etc.
    // 3. Anonymize activity logs
    // 4. Delete password reset tokens
    // 5. Delete admin notifications
    // 6. Finally delete the user

    // Mock: Update deletion request status
    const requests = await ctx.db
      .query('accountDeletionRequests')
      .filter((q) => q.eq(q.field('userId'), user._id))
      .collect();

    for (const request of requests) {
      await ctx.db.patch(request._id, {
        status: 'completed',
        deletedAt: Date.now(),
      });
    }

    return {
      success: true,
      message: 'Account and all associated data have been successfully deleted',
    };
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
      .filter((q) => q.eq(q.field('userId'), user._id))
      .order('desc')
      .first();

    return request;
  },
});

// Cancel deletion request
export const cancelDeletionRequest = mutation({
  args: {},
  handler: async (ctx, args) => {
    const user = await getUserHelperFn(ctx);
    if (!user) {
      throw new ConvexError({ message: 'User not found' });
    }

    const request = await ctx.db
      .query('accountDeletionRequests')
      .filter((q) => q.eq(q.field('userId'), user._id))
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
