import { filter } from 'convex-helpers/server/filter';
import { paginationOptsValidator } from 'convex/server';
import { ConvexError, v } from 'convex/values';
import { internal } from './_generated/api';
import { type Id } from './_generated/dataModel';
import {
  internalMutation,
  mutation,
  query,
  type QueryCtx as QCtx,
  type QueryCtx,
} from './_generated/server';
import {
  handleNurseCount,
  handlePendingNurseAccountsUpdate,
  handlePendingNurseApprovalCount,
  updateCount,
} from './counter';
import {
  checkDurationOfNotSubmittedAssignment,
  getAvailability,
  getImage,
  getRatings,
} from './helper';
import { discipline } from './schema';
import { getUserHelper } from './users';

// Returns true if the nurse's userId has a pending deletion request
const isNursePendingDeletion = async (
  ctx: QCtx,
  userId: string,
): Promise<boolean> => {
  const pending = await ctx.db
    .query('accountDeletionRequests')
    .withIndex('by_userId', (q) => q.eq('userId', userId))
    .filter((q) => q.eq(q.field('status'), 'pending'))
    .first();
  return !!pending;
};

export const createNurse = mutation({
  args: {
    gender: v.string(),
    phoneNumber: v.string(),
    licenseNumber: v.string(),
    stateOfRegistration: v.string(),
    dateOfBirth: v.string(),
    discipline: discipline,
    rate: v.number(),
    address: v.string(),
    zipCode: v.string(),
    nurseTimezone: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const identity = await ctx.auth.getUserIdentity();

      if (!identity) {
        throw new ConvexError({ message: 'Unauthorized' });
      }

      const nurseId = await ctx.db.insert('nurses', {
        ...args,
        status: 'pending',
        userId: identity.subject,
        name: identity.name || '',
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

      await handlePendingNurseApprovalCount(ctx, 'inc');
      await handleNurseCount(ctx, 'inc');
      await ctx.db.insert('adminActivityNotifications', {
        description: `${identity.name} has created a new nurse account`,
        type: 'nurse',
        isRead: false,
        title: 'New Nurse account created',
        nurseId: nurseId,
      });
    } catch (error: any) {
      throw new ConvexError({ message: error.message });
    }
  },
});

export const updateCountPending = internalMutation({
  args: {},
  handler: async (ctx, args) => {
    await updateCount(ctx);
  },
});

export const getNurseById = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getUserHelper(ctx, args.userId);
    if (!user) {
      return null;
    }
    const userId = user._id;
    const nurse = await ctx.db
      .query('nurses')
      .withIndex('userId', (q) => q.eq('userId', userId))
      .first();
    if (!nurse) {
      return null;
    }

    const availabilities = await ctx.db
      .query('availabilities')
      .withIndex('nurseId', (q) => q.eq('nurseId', nurse._id))
      .first();
    const image = nurse.imageId ? await getImage(ctx, nurse.imageId) : null;

    return {
      ...nurse,
      email: user?.email as string,
      image,
      availabilities,
    };
  },
});

export const updateNurseDailyAvailability = mutation({
  args: {
    nurseId: v.id('nurses'),
    day: v.string(),
    available: v.boolean(),
  },
  handler: async (ctx, args) => {
    try {
      const nurse = await ctx.db.get(args.nurseId);
      if (!nurse) {
        throw new ConvexError({ message: 'Nurse not found' });
      }
      const availabilities = await ctx.db
        .query('availabilities')
        .withIndex('nurseId', (q) => q.eq('nurseId', nurse._id))
        .first();
      if (!availabilities) {
        throw new ConvexError({ message: 'Availabilities not found' });
      }
      const days = availabilities.days.map((day) => {
        if (day.day === args.day) {
          return {
            ...day,
            available: args.available,
          };
        }
        return day;
      });
      await ctx.db.patch(availabilities._id, {
        days,
      });
    } catch (error: any) {
      throw new ConvexError({ message: error.message });
    }
  },
});
export const updateNurseStartAndEndTimeAvailability = mutation({
  args: {
    nurseId: v.id('nurses'),
    day: v.string(),
    startTime: v.number(),
    endTime: v.number(),
  },
  handler: async (ctx, args) => {
    try {
      const nurse = await ctx.db.get(args.nurseId);
      if (!nurse) {
        throw new ConvexError({ message: 'Nurse not found' });
      }
      const availabilities = await ctx.db
        .query('availabilities')
        .withIndex('nurseId', (q) => q.eq('nurseId', nurse._id))
        .first();
      if (!availabilities) {
        throw new ConvexError({ message: 'Availabilities not found' });
      }
      const days = availabilities.days.map((day) => {
        if (day.day === args.day) {
          return {
            ...day,
            startTime: args.startTime,
            endTime: args.endTime,
          };
        }
        return day;
      });
      await ctx.db.patch(availabilities._id, {
        days,
      });
    } catch (error: any) {
      throw new ConvexError({ message: error.message });
    }
  },
});

export const editNurse = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    phoneNumber: v.string(),
    licenseNumber: v.string(),
    stateOfRegistration: v.string(),
    discipline: discipline,
    rate: v.optional(v.number()),
    address: v.optional(v.string()),
    nurseId: v.id('nurses'),
    zipCode: v.optional(v.string()),
    dateOfBirth: v.optional(v.string()),
    adminApproval: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({ message: 'Unauthorized' });
    }

    const nurse = await ctx.db.get(args.nurseId);
    if (!nurse) {
      throw new ConvexError({ message: 'Nurse not found' });
    }

    await ctx.db.patch(nurse._id, {
      rate: args.rate,
      address: args.address,
      phoneNumber: args.phoneNumber,
      zipCode: args.zipCode,
    });

    if (args.adminApproval) {
      await ctx.db.insert('pendingNurseProfile', {
        firstName: args.firstName,
        lastName: args.lastName,
        licenseNumber: args.licenseNumber,
        stateOfRegistration: args.stateOfRegistration,
        discipline: args.discipline,
        isApproved: false,
        nurseId: args.nurseId,
        dateOfBirth: args.dateOfBirth,
      });
      await ctx.db.insert('adminActivityNotifications', {
        description: `New Nurse Profile Update Request from ${nurse.name}`,
        type: 'nurse',
        isRead: false,
        title: 'New Nurse Profile Update Request',
        nurseId: args.nurseId,
      });
      await handlePendingNurseAccountsUpdate(ctx, 'inc');
    }
  },
});

export const updateNurseProfilePicture = mutation({
  args: {
    nurseId: v.id('nurses'),
    imageId: v.id('_storage'),
    oldImageId: v.optional(v.id('_storage')),
  },
  handler: async (ctx, args) => {
    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        throw new ConvexError({ message: 'Unauthorized' });
      }
      const nurse = await ctx.db.get(args.nurseId);
      if (!nurse) {
        throw new ConvexError({ message: 'Nurse not found' });
      }
      await ctx.db.patch(nurse._id, {
        imageId: args.imageId,
      });
      await ctx.db.patch(nurse._id, {
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

export const rateNurse = mutation({
  args: { rate: v.number(), nurseId: v.id('nurses') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({ message: 'Unauthorized' });
    }

    const nurse = await ctx.db.get(args.nurseId);
    if (!nurse) {
      throw new ConvexError({ message: 'Nurse not found' });
    }
    await ctx.db.insert('ratings', {
      nurseId: args.nurseId,
      rate: args.rate,
    });
  },
});

// ? queries
export const getNurses = query({
  args: {
    range1: v.number(),
    range2: v.number(),
    discipline: v.union(
      v.literal('RN'),
      v.literal('LVN'),
      v.literal('HHA'),
      v.literal('All'),
    ),
    todayToText: v.string(),
    paginationOpts: paginationOptsValidator,
    nurseId: v.optional(v.union(v.id('nurses'), v.null())),
  },
  handler: async (ctx, args) => {
    const minRange = Math.min(args.range1, args.range2);
    const maxRange = Math.max(args.range1, args.range2);

    // Build the query with TypeScript filter
    const nurses = await filter(ctx.db.query('nurses'), (nurse) => {
      // Apply discipline filter
      const matchesDiscipline =
        args.discipline === 'All' || nurse.discipline === args.discipline;
      // Apply range filter
      const matchesRange =
        (nurse.rate || 0) >= minRange && (nurse.rate || 0) <= maxRange;
      // Apply nurseId filter
      const matchesNurseId = !args.nurseId || nurse._id !== args.nurseId;
      return (
        matchesDiscipline &&
        matchesRange &&
        matchesNurseId &&
        nurse.status === 'approved'
      );
    }).paginate(args.paginationOpts);
    // Exclude nurses with a pending deletion request
    const nursesFiltered = await Promise.all(
      nurses.page.map(async (nurse) => {
        const pendingDeletion = await isNursePendingDeletion(ctx, nurse.userId);
        return pendingDeletion ? null : nurse;
      }),
    ).then((results) => results.filter(Boolean) as typeof nurses.page);

    const nursesImage = await Promise.all(
      nursesFiltered.map(async (nurse) => {
        const image = await getImage(ctx, nurse.imageId);
        const available = await getAvailability(
          ctx,
          nurse._id,
          args.todayToText,
        );
        const ratings = await getRatings(ctx, nurse._id);
        return {
          ...nurse,
          image,
          available,
          ratings,
        };
      }),
    );
    return {
      ...nurses,
      page: nursesImage,
    };
  },
});

export const getNurseByNurseId = query({
  args: {
    nurseId: v.id('nurses'),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({ message: 'Unauthorized' });
    }

    const nurse = await ctx.db.get(args.nurseId);
    if (!nurse) {
      throw new ConvexError({ message: 'Nurse not found' });
    }
    const user = await getUserHelper(ctx, nurse.userId);
    if (!user) {
      throw new ConvexError({ message: 'User not found' });
    }
    const image = nurse.imageId
      ? await ctx.storage.getUrl(nurse.imageId)
      : null;
    return {
      ...nurse,
      image,
      email: user.email || 'N/A',
    };
  },
});

export const searchNursesByFirstNameAndLastName = query({
  args: {
    name: v.string(),
    todayToText: v.string(),
    discipline: v.optional(discipline),
  },
  handler: async (ctx, args) => {
    const nurses = await filter(ctx.db.query('nurses'), (nurse) => {
      if (!args.name) return false;
      if (args.discipline) {
        return (
          nurse.name.toLowerCase().includes(args.name.toLowerCase()) &&
          nurse.discipline === args.discipline
        );
      }
      return nurse.name.toLowerCase().includes(args.name.toLowerCase());
    }).take(30);

    // Exclude nurses with a pending deletion request
    const nursesFiltered = await Promise.all(
      nurses.map(async (nurse) => {
        const pendingDeletion = await isNursePendingDeletion(ctx, nurse.userId);
        return pendingDeletion ? null : nurse;
      }),
    ).then((results) => results.filter(Boolean) as typeof nurses);

    const nursesImage = await Promise.all(
      nursesFiltered.map(async (nurse) => {
        const image = await getImage(ctx, nurse.imageId);
        const available = await getAvailability(
          ctx,
          nurse._id,
          args.todayToText,
        );
        const ratings = await getRatings(ctx, nurse._id);
        return {
          ...nurse,
          image,
          available,
          ratings,
        };
      }),
    );

    return nursesImage;
  },
});

// ? helpers

export const getNurseDetails = async (
  ctx: QueryCtx,
  nurseId?: Id<'nurses'>,
) => {
  if (!nurseId) {
    return null;
  }
  const nurse = await ctx.db.get('nurses', nurseId);
  if (!nurse) {
    return null;
  }
  const nurseUser = await getUserHelper(ctx, nurse.userId);
  if (!nurseUser) {
    return null;
  }
  const image = nurse.imageId ? await getImage(ctx, nurse.imageId) : null;
  return {
    ...nurse,
    image,
    nurseUser,
  };
};

export const sendNotificationsToNursesOnFifthDay = internalMutation({
  args: {
    cursor: v.union(v.string(), v.null()),
    numItems: v.number(),
  },
  handler: async (ctx, args) => {
    const data = await filter(
      ctx.db.query('nurseAssignments'),
      (nurseAssignment) => {
        // Exactly on day 5 (>= 5 days AND < 6 days since completion)
        return checkDurationOfNotSubmittedAssignment(5, nurseAssignment, 6);
      },
    ).paginate(args);

    const { page, isDone, continueCursor } = data;

    for (const assignment of page) {
      await ctx.db.insert('nurseNotifications', {
        nurseId: assignment.nurseId,
        isRead: false,
        description: `Complete and submit all outstanding route sheets to avoid account deactivation.`,
        title: 'Outstanding route sheet',
        type: 'admin',
        viewCount: 0,
      });
    }

    if (!isDone) {
      await ctx.scheduler.runAfter(
        0,
        internal.nurses.sendNotificationsToNursesOnFifthDay,
        {
          cursor: continueCursor,
          numItems: args.numItems,
        },
      );
    }
  },
});
export const sendNotificationsToNursesOnSixthDay = internalMutation({
  args: {
    cursor: v.union(v.string(), v.null()),
    numItems: v.number(),
  },
  handler: async (ctx, args) => {
    const data = await filter(
      ctx.db.query('nurseAssignments'),
      (nurseAssignment) => {
        // Exactly on day 6 (>= 6 days AND < 7 days since completion)
        return checkDurationOfNotSubmittedAssignment(6, nurseAssignment, 7);
      },
    ).paginate(args);

    const { page, isDone, continueCursor } = data;

    for (const assignment of page) {
      await ctx.db.insert('nurseNotifications', {
        nurseId: assignment.nurseId,
        isRead: false,
        description: `Complete and submit all outstanding route sheets to avoid account deactivation.`,
        title: 'Outstanding route sheet',
        type: 'admin',
        viewCount: 0,
      });
    }

    if (!isDone) {
      await ctx.scheduler.runAfter(
        0,
        internal.nurses.sendNotificationsToNursesOnSixthDay,
        {
          cursor: continueCursor,
          numItems: args.numItems,
        },
      );
    }
  },
});

export const sendNotificationsToNursesAndSuspendAccount = internalMutation({
  args: {
    cursor: v.union(v.string(), v.null()),
    numItems: v.number(),
  },
  handler: async (ctx, args) => {
    const data = await filter(
      ctx.db.query('nurseAssignments'),
      (nurseAssignment) => {
        // Exactly on day 7+ (>= 7 days, no upper bound — also suspends account)
        return checkDurationOfNotSubmittedAssignment(7, nurseAssignment);
      },
    ).paginate(args);

    const { page, isDone, continueCursor } = data;

    for (const assignment of page) {
      await ctx.db.insert('nurseNotifications', {
        nurseId: assignment.nurseId,
        isRead: false,
        description: `Complete and submit all outstanding route sheets to reactivate your account.`,
        title: 'Account suspension',
        type: 'admin',
        viewCount: 0,
      });
      await ctx.db.patch('nurses', assignment.nurseId, {
        status: 'suspended',
      });
    }

    if (!isDone) {
      await ctx.scheduler.runAfter(
        0,
        internal.nurses.sendNotificationsToNursesAndSuspendAccount,
        {
          cursor: continueCursor,
          numItems: args.numItems,
        },
      );
    }
  },
});
