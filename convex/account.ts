import { ConvexError, v } from 'convex/values';
import { mutation } from './_generated/server';
import { getUserHelperFn } from './helper';

export const changeAccountType = mutation({
  args: {
    currentAccountType: v.union(v.literal('nurse'), v.literal('hospice')),
  },
  handler: async (ctx, args) => {
    const user = await getUserHelperFn(ctx);
    if (!user) {
      throw new ConvexError({ message: 'User not found' });
    }

    if (args.currentAccountType === 'hospice') {
      const hospice = await ctx.db
        .query('hospices')
        .withIndex('userId', (q) => q.eq('userId', user._id))
        .first();

      if (!hospice) {
        throw new ConvexError({ message: 'Hospice profile not found' });
      }

      // Check if they have created assignments
      const assignment = await ctx.db
        .query('assignments')
        .withIndex('hospiceId', (q) => q.eq('hospiceId', hospice._id))
        .first();

      if (assignment) {
        throw new ConvexError({
          message:
            'You have created assignments. You cannot change your account type.',
        });
      }

      // Delete pending profile if exists
      const pendingHospice = await ctx.db
        .query('pendingHospiceProfile')
        .withIndex('by_hospice_id', (q) => q.eq('hospiceId', hospice._id))
        .first();
      if (pendingHospice) {
        await ctx.db.delete(pendingHospice._id);
      }

      // Delete core profile
      await ctx.db.delete(hospice._id);
    } else if (args.currentAccountType === 'nurse') {
      const nurse = await ctx.db
        .query('nurses')
        .withIndex('userId', (q) => q.eq('userId', user._id))
        .first();

      if (!nurse) {
        throw new ConvexError({ message: 'Nurse profile not found' });
      }

      // Check for tied nurseAssignments
      const tiedAssignment = await ctx.db
        .query('nurseAssignments')
        .withIndex('nurse_id', (q) => q.eq('nurseId', nurse._id))
        .first();

      if (tiedAssignment) {
        throw new ConvexError({
          message:
            'You have assignments linked to you. You cannot change your account type.',
        });
      }

      // Delete availability
      const availabilities = await ctx.db
        .query('availabilities')
        .withIndex('nurseId', (q) => q.eq('nurseId', nurse._id))
        .collect();
      for (const availability of availabilities) {
        await ctx.db.delete(availability._id);
      }

      // Delete pending profile if exists
      const pendingNurse = await ctx.db
        .query('pendingNurseProfile')
        .withIndex('by_nurse_id', (q) => q.eq('nurseId', nurse._id))
        .first();
      if (pendingNurse) {
        await ctx.db.delete(pendingNurse._id);
      }

      // Delete core profile
      await ctx.db.delete(nurse._id);
    }

    return { success: true };
  },
});
