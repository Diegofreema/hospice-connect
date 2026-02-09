import { ConvexError, v } from 'convex/values';
import { type Id } from './_generated/dataModel';
import { mutation, query, type QueryCtx } from './_generated/server';
import {
  handleHospiceCount,
  handlePendingHospiceApprovalCount,
} from './counter';
import { getUserHelper } from './users';

export const createHospice = mutation({
  args: {
    address: v.string(),
    businessName: v.string(),
    licenseNumber: v.string(),
    state: v.string(),
    phoneNumber: v.string(),
    zipcode: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError({ message: 'Unauthorized' });
    }

    await ctx.db.insert('hospices', {
      address: args.address,
      businessName: args.businessName,
      licenseNumber: args.licenseNumber,
      state: args.state,
      approved: false,
      userId: identity.subject,
      phoneNumber: args.phoneNumber,
      email: identity.email as string,
      status: 'pending',
      zipcode: args.zipcode,
    });
    await handleHospiceCount(ctx, 'inc');
    await handlePendingHospiceApprovalCount(ctx, 'inc');
  },
});

export const getHospiceByUserId = query({
  args: {},
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await getUserHelper(ctx, identity.subject);
    if (!user) {
      return null;
    }
    const hospice = await ctx.db
      .query('hospices')
      .withIndex('userId', (q) => q.eq('userId', user._id))
      .first();
    let image;
    if (hospice?.imageId) {
      image = await ctx.storage.getUrl(hospice.imageId);
    }

    return {
      ...hospice,
      image,
      user,
    };
  },
});

export const updateHospiceImage = mutation({
  args: {
    hospiceId: v.id('hospices'),
    imageId: v.id('_storage'),
    oldImageId: v.optional(v.id('_storage')),
  },
  handler: async (ctx, args) => {
    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        throw new ConvexError({ message: 'Unauthorized' });
      }
      const hospice = await ctx.db.get(args.hospiceId);
      if (!hospice) {
        throw new ConvexError({ message: 'Hospice not found' });
      }

      await ctx.db.patch(hospice._id, {
        imageId: args.imageId,
      });
      if (args.oldImageId) {
        await ctx.storage.delete(args.oldImageId);
      }
    } catch (error: any) {
      console.log({ error });

      throw new ConvexError({ message: error.message });
    }
  },
});

export const updateHospiceProfile = mutation({
  args: {
    address: v.string(),
    businessName: v.string(),
    licenseNumber: v.string(),
    state: v.string(),
    phoneNumber: v.string(),
    hospiceId: v.id('hospices'),
    email: v.string(),
    zipcode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({ message: 'Unauthorized' });
    }

    const user = await getUserHelper(ctx, identity.subject);
    if (!user) {
      throw new ConvexError({ message: 'Unauthorized' });
    }
    const hospice = await ctx.db.get(args.hospiceId);
    if (!hospice) {
      throw new ConvexError({ message: 'Hospice not found' });
    }
    if (hospice.userId !== user._id) {
      throw new ConvexError({ message: 'Unauthorized' });
    }

    await handlePendingHospiceApprovalCount(ctx, 'inc');
    await ctx.db.insert('adminActivityNotifications', {
      description: `New Hospice Profile Update Request from ${hospice.businessName}`,
      type: 'hospice',
      isRead: false,
      title: 'New Hospice Profile Update Request',
      hospiceId: args.hospiceId,
    });
    return await ctx.db.insert('pendingHospiceProfile', {
      address: args.address,
      businessName: args.businessName,
      licenseNumber: args.licenseNumber,
      state: args.state,
      phoneNumber: args.phoneNumber,
      email: args.email,
      hospiceId: args.hospiceId,
      isApproved: false,
      zipcode: args.zipcode,
    });
  },
});

export const deleteHospice = mutation({
  args: {
    hospiceId: v.id('hospices'),
  },
  handler: async (ctx, args) => {
    const hospice = await ctx.db.get(args.hospiceId);
    if (!hospice) {
      return;
    }
    if (hospice.imageId) {
      await ctx.storage.delete(hospice.imageId);
    }
    await ctx.db.delete(args.hospiceId);
  },
});

// ? helpers

export const getHospiceAndImage = async (
  ctx: QueryCtx,
  hospiceId?: Id<'hospices'>,
) => {
  if (!hospiceId) {
    return null;
  }
  const hospice = await ctx.db.get(hospiceId);
  if (!hospice) {
    return null;
  }
  const user = await getUserHelper(ctx, hospice.userId);
  if (!user) {
    return null;
  }
  let image;
  if (hospice.imageId) {
    image = await ctx.storage.getUrl(hospice.imageId);
  }
  return {
    ...hospice,
    image,
  };
};
