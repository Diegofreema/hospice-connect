import { mutation, query } from './_generated/server';
import { ConvexError, v } from 'convex/values';
import { getUserHelperFn } from './helper';
import { authComponent, createAuth } from './auth';

// Get admin profile with commission info

// Update admin profile (name and email)
export const updateAdminProfile = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getUserHelperFn(ctx);
    if (user?.role !== 'admin' && user?.role !== 'super_admin') {
      throw new ConvexError({
        message: 'Only admin and super admin can access this data',
      });
    }
    const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
    await auth.api.updateUser({
      body: {
        name: args.name,
      },
      headers,
    });
  },
});

export const changePassword = mutation({
  args: {
    currentPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getUserHelperFn(ctx);
    if (user?.role !== 'admin' && user?.role !== 'super_admin') {
      throw new ConvexError({
        message: 'Only admin and super admin can access this data',
      });
    }
    const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
    await auth.api.changePassword({
      body: {
        currentPassword: args.currentPassword,
        newPassword: args.newPassword,
      },
      headers,
    });
  },
});

// Update admin commission percentage
export const updateAdminCommission = mutation({
  args: {
    commissionPercentage: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getUserHelperFn(ctx);
    if (user?.role !== 'admin' && user?.role !== 'super_admin') {
      throw new ConvexError({
        message: 'Only admin and super admin can access this data',
      });
    }

    const commission = await ctx.db.query('commission').first();
    if (!commission) {
      await ctx.db.insert('commission', {
        commissionPercentage: args.commissionPercentage,
      });
    } else {
      await ctx.db.patch('commission', commission._id, {
        commissionPercentage: args.commissionPercentage,
      });
    }
  },
});

export const getCommission = query({
  args: {},
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({
        message: 'User not authenticated',
      });
    }
    const commission = await ctx.db.query('commission').first();

    return commission?.commissionPercentage || 0;
  },
});
