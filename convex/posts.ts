import { getAuthUserId } from '@convex-dev/auth/server';
import { paginationOptsValidator } from 'convex/server';
import { ConvexError, v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { checkIfNurseHasActiveShift, formatDate } from './helper';
import { discipline } from './schema';
import { getUserHelper } from './users';

export const getOurPosts = query({
  args: {
    hospiceId: v.id('hospices'),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const posts = await ctx.db
      .query('assignments')
      .filter((q) => q.eq(q.field('hospiceId'), args.hospiceId))
      .order('desc')
      .paginate(args.paginationOpts);

    // check if each post has shifts with nurses
    const postsWithShifts = posts.page.map(async (post) => {
      const schedules = await ctx.db
        .query('schedules')
        .withIndex('by_assignment_id', (q) => q.eq('assignmentId', post._id))
        .collect();
      const hasNurses = schedules.some((schedule) => schedule.nurseId);
      return {
        ...post,
        hasNurses,
      };
    });
    return {
      ...posts,
      page: await Promise.all(postsWithShifts),
    };
  },
});
export const getOurAvailablePosts = query({
  args: {
    hospiceId: v.id('hospices'),
    discipline: discipline,
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('assignments')
      .withIndex('hospiceId', (q) =>
        q
          .eq('hospiceId', args.hospiceId)
          .eq('status', 'available')
          .eq('discipline', args.discipline)
      )
      .order('desc')
      .take(50);
  },
});

export const getPost = query({
  args: {
    scheduleId: v.id('schedules'),
    nurseNotificationId: v.optional(v.id('nurseNotifications')),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    const schedule = await ctx.db.get(args.scheduleId);
    if (!schedule) {
      return null;
    }
    const assignment = await ctx.db.get(schedule.assignmentId);
    if (!assignment) {
      return null;
    }
    const nurseNotification = args.nurseNotificationId
      ? await ctx.db.get(args.nurseNotificationId)
      : null;

    const hospice = await ctx.db.get(assignment.hospiceId);
    if (!hospice) {
      return null;
    }
    const user = await getUserHelper(ctx, hospice.userId);
    if (!user) {
      return null;
    }

    return {
      schedule,
      assignment,
      hospice,
      nurseNotification,
    };
  },
});
export const getShift = query({
  args: {
    scheduleId: v.id('schedules'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db.get(args.scheduleId);
  },
});

// ? mutations

export const acceptAssignment = mutation({
  args: {
    scheduleId: v.id('schedules'),
    nurseId: v.id('nurses'),
    nurseNotificationId: v.optional(v.id('nurseNotifications')),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({ message: 'Unauthorized' });
    }
    const user = await getUserHelper(ctx, identity.subject);
    if (!user) {
      throw new ConvexError({ message: 'User not found' });
    }
    const nurse = await ctx.db.get(args.nurseId);
    if (!nurse) {
      throw new ConvexError({ message: 'Nurse not found' });
    }
    const schedule = await ctx.db.get(args.scheduleId);
    if (!schedule) {
      throw new ConvexError({ message: 'Schedule not found' });
    }
    const assignment = await ctx.db.get(schedule.assignmentId);
    if (!assignment) {
      throw new ConvexError({ message: 'Assignment not found' });
    }

    if (schedule.status === 'not_covered') {
      throw new ConvexError({ message: 'Shift was not covered' });
    }

    if (schedule.status === 'booked' || schedule.status === 'on_going') {
      throw new ConvexError({ message: 'Shift already booked' });
    }

    if (schedule.status === 'completed') {
      throw new ConvexError({ message: 'Shift already completed' });
    }

    if (schedule.nurseId) {
      throw new ConvexError({ message: 'Shift already accepted' });
    }

    // Check if the nurse has an active shift
    await checkIfNurseHasActiveShift({
      ctx,
      nurseId: args.nurseId,
      hospiceTimezone: assignment.hospiceTimezone,
      shift: schedule,
      isHospice: false,
    });

    const nurseAssignmentExists = await ctx.db
      .query('nurseAssignments')
      .withIndex('assignmentId', (q) =>
        q.eq('assignmentId', assignment._id).eq('nurseId', args.nurseId)
      )
      .first();
    if (!nurseAssignmentExists) {
      await ctx.db.insert('nurseAssignments', {
        isCompleted: false,
        nurseId: args.nurseId,
        assignmentId: assignment._id,
      });
    }
    await ctx.db.patch(args.scheduleId, {
      nurseId: args.nurseId,
      status: 'booked',
    });

    await ctx.db.insert('hospiceNotifications', {
      isRead: false,
      hospiceId: assignment.hospiceId,
      type: 'assignment',
      title: 'Schedule accepted',
      scheduleId: args.scheduleId,
      description: `${nurse.name} (${nurse.discipline}) has accepted your case request for ${formatDate(schedule.startDate)} to ${formatDate(schedule.endDate)}; ${schedule.startTime} - ${schedule.endTime}.`,
      nurseId: args.nurseId,
      viewCount: 0,
    });
    if (args.nurseNotificationId) {
      const notification = await ctx.db.get(args.nurseNotificationId);

      if (notification) {
        await ctx.db.patch(args.nurseNotificationId, {
          status: 'accepted',
        });
      }
    }
  },
});

export const declineAssignment = mutation({
  args: {
    scheduleId: v.id('schedules'),
    nurseNotificationId: v.id('nurseNotifications'),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({ message: 'Unauthorized' });
    }
    const user = await getUserHelper(ctx, identity.subject);
    if (!user) {
      throw new ConvexError({ message: 'User not found' });
    }
    const schedule = await ctx.db.get(args.scheduleId);
    if (!schedule) {
      throw new ConvexError({ message: 'Schedule not found' });
    }
    const assignment = await ctx.db.get(schedule.assignmentId);
    if (!assignment) {
      throw new ConvexError({ message: 'Assignment not found' });
    }

    const notification = await ctx.db.get(args.nurseNotificationId);
    if (!notification) {
      throw new ConvexError({ message: 'Notification not found' });
    }

    const nurse = await ctx.db.get(notification.nurseId);
    if (!nurse) {
      throw new ConvexError({ message: 'Nurse not found' });
    }

    await ctx.db.patch(args.nurseNotificationId, {
      status: 'declined',
    });

    await ctx.db.insert('hospiceNotifications', {
      isRead: false,
      hospiceId: assignment.hospiceId,
      type: 'assignment',
      title: 'Assignment Declined',
      scheduleId: args.scheduleId,
      description: `${nurse.name} (${nurse.discipline}) has declined your case request for ${formatDate(schedule.startDate)} to ${formatDate(schedule.endDate)}; ${schedule.startTime} - ${schedule.endTime}.`,
      nurseId: notification.nurseId,
      viewCount: 0,
    });
  },
});

// export const updateAssignmentToCompleted = mutation({
//   args: {
//     nurseId: v.id('nurses'),
//     assignmentId: v.id('assignments'),
//   },
//   handler: async (ctx, args) => {
//     const nurseAssignments = await ctx.db
//       .query('nurseAssignments')
//       .withIndex('nurse_id', (q) =>
//         q
//           .eq('nurseId', args.nurseId)
//           .eq('isCompleted', false)
//           .eq('assignmentId', args.assignmentId)
//       )
//       .first();
//     if (nurseAssignments) {
//       const schedules = await ctx.db
//         .query('schedules')
//         .withIndex('nurse_id', (q) =>
//           q.eq('nurseId', args.nurseId).eq('assignmentId', args.assignmentId)
//         )
//         .collect();

//       const allScheduleIsComplete = schedules.every(
//         (s) => s.status === 'completed'
//       );
//       if (allScheduleIsComplete) {
//         await ctx.db.patch(nurseAssignments._id, {
//           isCompleted: true,
//           completedAt: new Date().getTime(),
//         });
//       }
//     }
//   },
// });
export const updateAssignmentToNotCompleted = mutation({
  args: {
    nurseId: v.id('nurses'),
    assignmentId: v.id('assignments'),
  },
  handler: async (ctx, args) => {
    const nurseAssignments = await ctx.db
      .query('nurseAssignments')
      .withIndex('nurse_id', (q) =>
        q
          .eq('nurseId', args.nurseId)
          .eq('isCompleted', false)
          .eq('assignmentId', args.assignmentId)
      )
      .first();
    if (nurseAssignments) {
      const schedules = await ctx.db
        .query('schedules')
        .withIndex('nurse_id', (q) =>
          q.eq('nurseId', args.nurseId).eq('assignmentId', args.assignmentId)
        )
        .collect();
      const allScheduleIsComplete = schedules.every(
        (s) => s.status === 'completed'
      );
      if (!allScheduleIsComplete) {
        await ctx.db.patch(nurseAssignments._id, {
          isCompleted: false,
        });
      }
    }
  },
});
