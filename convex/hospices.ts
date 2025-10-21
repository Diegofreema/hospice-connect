import { getAuthUserId } from '@convex-dev/auth/server';
import { ConvexError, v } from 'convex/values';
import { Id } from './_generated/dataModel';
import { mutation, query, QueryCtx } from './_generated/server';

export const createHospice = mutation({
  args: {
    address: v.string(),
    businessName: v.string(),
    licenseNumber: v.string(),
    state: v.string(),

    phoneNumber: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError({ message: 'Unauthorized' });
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      throw new ConvexError({ message: 'Unauthorized' });
    }

    await ctx.db.patch(user._id, {
      name: args.businessName,
      isBoarded: true,
    });

    return await ctx.db.insert('hospices', {
      address: args.address,
      businessName: args.businessName,
      licenseNumber: args.licenseNumber,
      state: args.state,
      approved: false,
      userId: userId,
      phoneNumber: args.phoneNumber,
      email: user.email as string,
    });
  },
});

export const getHospiceByUserId = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }
    const hospice = await ctx.db
      .query('hospices')
      .withIndex('userId', (q) => q.eq('userId', userId))
      .first();
    let image;
    if (user.imageId) {
      image = await ctx.storage.getUrl(user.imageId);
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
      const hospice = await ctx.db.get(args.hospiceId);
      if (!hospice) {
        throw new ConvexError({ message: 'Nurse not found' });
      }

      await ctx.db.patch(hospice.userId, {
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
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError({ message: 'Unauthorized' });
    }
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new ConvexError({ message: 'Unauthorized' });
    }
    const hospice = await ctx.db.get(args.hospiceId);
    if (!hospice) {
      throw new ConvexError({ message: 'Hospice not found' });
    }
    if (hospice.userId !== userId) {
      throw new ConvexError({ message: 'Unauthorized' });
    }

    return await ctx.db.insert('pendingHospiceProfile', {
      address: args.address,
      businessName: args.businessName,
      licenseNumber: args.licenseNumber,
      state: args.state,
      phoneNumber: args.phoneNumber,
      email: args.email,
      hospiceId: args.hospiceId,
      isApproved: false,
    });
  },
});

// ? helpers

export const getHospiceAndImage = async (
  ctx: QueryCtx,
  hospiceId?: Id<'hospices'>
) => {
  if (!hospiceId) {
    return null;
  }
  const hospice = await ctx.db.get(hospiceId);
  if (!hospice) {
    return null;
  }
  const user = await ctx.db.get(hospice.userId);
  if (!user) {
    return null;
  }
  let image;
  if (user.imageId) {
    image = await ctx.storage.getUrl(user.imageId);
  }
  return {
    ...hospice,
    image,
  };
};
