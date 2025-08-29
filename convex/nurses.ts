import { getAuthUserId } from '@convex-dev/auth/server';
import { ConvexError, v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { getImage } from './helper';
import { discipline } from './schema';

export const createNurse = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    gender: v.string(),
    phoneNumber: v.string(),
    licenseNumber: v.string(),
    stateOfRegistration: v.string(),
    dateOfBirth: v.string(),
    discipline: discipline,
  },
  handler: async (ctx, args) => {
    try {
      const userId = await getAuthUserId(ctx);
      if (!userId) {
        throw new ConvexError('Unauthorized');
      }
      const nurseId = await ctx.db.insert('nurses', {
        ...args,
        isApproved: false,
        userId,
      });
      const days = [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ] as const;
      const formattedDays = days.map((day) => ({
        day: day,
        available: false,
      }));
      await ctx.db.insert('availabilities', {
        nurseId,
        days: formattedDays,
      });
      await ctx.db.patch(userId, {
        isBoarded: true,
        isNurse: true,
      });
    } catch (error: any) {
      throw new ConvexError(error);
    }
  },
});

export const getNurse = query({
  args: {},
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    const nurse = await ctx.db
      .query('nurses')
      .withIndex('userId', (q) => q.eq('userId', userId))
      .first();
    if (!nurse) {
      return null;
    }
    const image = nurse.imageId ? await getImage(ctx, nurse.imageId) : null;
    return {
      ...nurse,
      image,
    };
  },
});
