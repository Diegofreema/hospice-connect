import { paginationOptsValidator } from 'convex/server';
import { ConvexError, v } from 'convex/values';
import { mutation, query } from './_generated/server';
import {
  getPendingHospiceAccountsUpdate,
  getPendingNurseAccountsUpdate,
  handlePendingHospiceAccountsUpdate,
  handlePendingNurseAccountsUpdate,
  updateCount,
} from './counter';
import { getUserHelperFn } from './helper';

// Get pending nurse profile updates
export const getPendingNurseUpdates = query({
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
    const results = await ctx.db
      .query('pendingNurseProfile')
      .withIndex('isApproved', (q) => q.eq('isApproved', false))
      .paginate(args.paginationOpts);

    return results;
  },
});

// Get pending hospice profile updates
export const getPendingHospiceUpdates = query({
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
    const results = await ctx.db
      .query('pendingHospiceProfile')
      .withIndex('isApproved', (q) => q.eq('isApproved', false))
      .order('desc')
      .paginate(args.paginationOpts);
    return results;
  },
});

export const getTotalPendingProfileUpdate = query({
  handler: async (ctx) => {
    const user = await getUserHelperFn(ctx);
    if (user?.role !== 'admin' && user?.role !== 'super_admin') {
      throw new ConvexError({
        message: 'Only admin and super admin can access this data',
      });
    }
    const nursePending = await getPendingNurseAccountsUpdate(ctx);
    const hospicePending = await getPendingHospiceAccountsUpdate(ctx);
    return {
      nursePending,
      hospicePending,
    };
  },
});

// Get nurse update details with current profile
export const getNurseUpdateDetails = query({
  args: { pendingProfileId: v.id('pendingNurseProfile') },
  handler: async (ctx, args) => {
    const user = await getUserHelperFn(ctx);
    if (user?.role !== 'admin' && user?.role !== 'super_admin') {
      throw new ConvexError({
        message: 'Only admin and super admin can access this data',
      });
    }
    const pendingProfile = await ctx.db.get(
      'pendingNurseProfile',
      args.pendingProfileId,
    );
    if (!pendingProfile)
      throw new ConvexError({ message: 'Pending profile not found' });

    const currentProfile = await ctx.db.get('nurses', pendingProfile.nurseId);
    if (!currentProfile)
      throw new ConvexError({ message: 'Current profile not found' });

    return { currentProfile, pendingProfile };
  },
});

// Get hospice update details with current profile
export const getHospiceUpdateDetails = query({
  args: { pendingProfileId: v.id('pendingHospiceProfile') },
  handler: async (ctx, args) => {
    const user = await getUserHelperFn(ctx);
    if (user?.role !== 'admin' && user?.role !== 'super_admin') {
      throw new ConvexError({
        message: 'Only admin and super admin can access this data',
      });
    }
    const pendingProfile = await ctx.db.get(
      'pendingHospiceProfile',
      args.pendingProfileId,
    );
    if (!pendingProfile)
      throw new ConvexError({ message: 'Pending profile not found' });

    const currentProfile = await ctx.db.get(
      'hospices',
      pendingProfile.hospiceId,
    );
    if (!currentProfile)
      throw new ConvexError({ message: 'Current profile not found' });

    return { currentProfile, pendingProfile };
  },
});

// Approve nurse profile update
export const approveNurseUpdate = mutation({
  args: { pendingProfileId: v.id('pendingNurseProfile') },
  handler: async (ctx, args) => {
    const user = await getUserHelperFn(ctx);
    if (user?.role !== 'admin' && user?.role !== 'super_admin') {
      throw new ConvexError({
        message: 'Only admin and super admin can access this data',
      });
    }
    const pending = await ctx.db.get(
      'pendingNurseProfile',
      args.pendingProfileId,
    );
    if (!pending)
      throw new ConvexError({ message: 'Pending profile not found' });

    const currentProfile = await ctx.db.get('nurses', pending.nurseId);
    if (!currentProfile)
      throw new ConvexError({ message: 'Current profile not found' });

    // Update existing profile
    await ctx.db.patch('nurses', currentProfile._id, {
      name: pending.firstName + ' ' + pending.lastName,
      discipline: pending.discipline,
      licenseNumber: pending.licenseNumber,
      stateOfRegistration: pending.stateOfRegistration,
      dateOfBirth: pending.dateOfBirth,
    });

    // Update pending profile status
    await ctx.db.delete('pendingNurseProfile', args.pendingProfileId);

    await ctx.db.insert('nurseNotifications', {
      nurseId: pending.nurseId,
      type: 'normal',
      title: 'Profile Update Approved',
      description: `Your profile update has been approved.`,
      isRead: false,
      viewCount: 0,
    });
    await handlePendingNurseAccountsUpdate(ctx, 'dec');
  },
});

// Reject nurse profile update
export const rejectNurseUpdate = mutation({
  args: {
    pendingProfileId: v.id('pendingNurseProfile'),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getUserHelperFn(ctx);
    if (user?.role !== 'admin' && user?.role !== 'super_admin') {
      throw new ConvexError({
        message: 'Only admin and super admin can access this data',
      });
    }
    const pending = await ctx.db.get(
      'pendingNurseProfile',
      args.pendingProfileId,
    );
    if (!pending)
      throw new ConvexError({ message: 'Pending profile not found' });

    // Update pending profile status
    await ctx.db.delete('pendingNurseProfile', args.pendingProfileId);
    await ctx.db.insert('nurseNotifications', {
      nurseId: pending.nurseId,
      type: 'normal',
      title: 'Profile Update Rejected',
      description: `Your profile update has been rejected. Reason: ${args.reason}`,
      isRead: false,
      viewCount: 0,
    });
    await handlePendingNurseAccountsUpdate(ctx, 'dec');
  },
});

// Approve hospice profile update
export const approveHospiceUpdate = mutation({
  args: { pendingProfileId: v.id('pendingHospiceProfile') },
  handler: async (ctx, args) => {
    const user = await getUserHelperFn(ctx);
    if (user?.role !== 'admin' && user?.role !== 'super_admin') {
      throw new ConvexError({
        message: 'Only admin and super admin can access this data',
      });
    }
    const pending = await ctx.db.get(
      'pendingHospiceProfile',
      args.pendingProfileId,
    );
    if (!pending)
      throw new ConvexError({ message: 'Pending profile not found' });

    const currentProfile = await ctx.db.get('hospices', pending.hospiceId);
    if (!currentProfile)
      throw new ConvexError({ message: 'Current profile not found' });

    // Update existing profile
    await ctx.db.patch(currentProfile._id, {
      address: pending.address,
      state: pending.state,
      zipcode: pending.zipcode,
      licenseNumber: pending.licenseNumber,
      businessName: pending.businessName,
      phoneNumber: pending.phoneNumber,
      email: pending.email,
      faxNumber: pending.faxNumber,
    });

    // Update pending profile status
    await ctx.db.delete('pendingHospiceProfile', args.pendingProfileId);

    await ctx.db.insert('hospiceNotifications', {
      hospiceId: pending.hospiceId,
      type: 'admin',
      title: 'Profile Update Approved',
      description: `Your profile update has been approved.`,
      isRead: false,
      viewCount: 0,
    });
    await handlePendingHospiceAccountsUpdate(ctx, 'dec');
  },
});

// Reject hospice profile update
export const rejectHospiceUpdate = mutation({
  args: {
    pendingProfileId: v.id('pendingHospiceProfile'),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getUserHelperFn(ctx);
    if (user?.role !== 'admin' && user?.role !== 'super_admin') {
      throw new ConvexError({
        message: 'Only admin and super admin can access this data',
      });
    }
    const pending = await ctx.db.get(args.pendingProfileId);
    if (!pending)
      throw new ConvexError({ message: 'Pending profile not found' });

    // Update pending profile status
    await ctx.db.delete('pendingHospiceProfile', args.pendingProfileId);

    await ctx.db.insert('hospiceNotifications', {
      hospiceId: pending.hospiceId,
      type: 'admin',
      title: 'Profile Update Rejected',
      description: `Your profile update has been rejected. Reason: ${args.reason}`,
      isRead: false,
      viewCount: 0,
    });
    await handlePendingHospiceAccountsUpdate(ctx, 'dec');
  },
});

export const updateCountMutation = mutation({
  handler: async (ctx) => {
    await updateCount(ctx);
  },
});
