import { paginationOptsValidator } from 'convex/server';
import { ConvexError, v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { doIntervalsOverlap, formatDate, parseDateTime } from './helper';
import { getNurseDetails } from './nurses';

export const unreadMessagesCount = query({
  args: {
    hospiceId: v.id('hospices'),
  },
  handler: async (ctx, { hospiceId }) => {
    const notifications = await ctx.db
      .query('hospiceNotifications')
      .withIndex('by_hospice_id', (q) =>
        q.eq('hospiceId', hospiceId).eq('isRead', false)
      )
      .collect();

    return notifications.length;
  },
});

export const getNotifications = query({
  args: {
    hospiceId: v.id('hospices'),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query('hospiceNotifications')
      .filter((q) => q.eq(q.field('hospiceId'), args.hospiceId))
      .order('desc')
      .paginate(args.paginationOpts);
    const page = await Promise.all(
      notifications.page.map(async (notification) => {
        const nurse = notification.nurseId
          ? await getNurseDetails(ctx, notification.nurseId)
          : null;
        return {
          ...notification,
          nurse,
        };
      })
    );
    return {
      ...notifications,
      page,
    };
  },
});

// ? mutations
export const updateViewCount = mutation({
  args: {
    notificationId: v.id('hospiceNotifications'),
  },
  handler: async (ctx, args) => {
    try {
      const notification = await ctx.db.get(args.notificationId);
      if (!notification) {
        return;
      }

      if (notification.viewCount > 1) {
        return;
      }

      await ctx.db.patch(notification._id, {
        viewCount: notification.viewCount + 1,
      });
    } catch (error) {
      console.log(error);
    }
  },
});
export const markNotificationAsRead = mutation({
  args: {
    hospiceId: v.id('hospices'),
  },
  handler: async (ctx, args) => {
    const hospice = await ctx.db.get(args.hospiceId);
    if (!hospice) {
      return;
    }

    const notifications = await ctx.db
      .query('hospiceNotifications')
      .withIndex('by_hospice_id', (q) =>
        q.eq('hospiceId', hospice._id).eq('isRead', false)
      )
      .collect();
    if (notifications.length === 0) {
      return;
    }
    for (const notification of notifications) {
      if (notification.viewCount > 1) {
        await ctx.db.patch(notification._id, { isRead: true });
      }
    }
  },
});

export const cancelShiftNotification = mutation({
  args: {
    nurseId: v.id('nurses'),
    shiftId: v.id('schedules'),
    reason: v.string(),
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

    const shift = await ctx.db.get(args.shiftId);
    if (!shift) {
      throw new ConvexError({ message: 'Shift not found' });
    }

    if (shift.status !== 'booked' && shift.status !== 'on_going') {
      throw new ConvexError({ message: 'Shift is not booked' });
    }

    const assignment = await ctx.db.get(shift.assignmentId);
    if (!assignment) {
      throw new ConvexError({ message: 'Assignment not found' });
    }

    const hospice = await ctx.db.get(assignment.hospiceId);
    if (!hospice) {
      throw new ConvexError({ message: 'Hospice not found' });
    }

    await ctx.db.insert('hospiceNotifications', {
      isRead: false,
      hospiceId: assignment.hospiceId,
      nurseId: nurse._id,
      type: 'cancel_request',
      description: args.reason,
      scheduleId: shift._id,
      title: `${nurse.name} submitted cancel request for ${formatDate(shift.startDate)} to ${formatDate(shift.endDate)}: ${shift.startTime}-${shift.endTime}`,
      viewCount: 0,
    });
  },
});

export const sendCaseRequestNotification = mutation({
  args: {
    nurseId: v.id('nurses'),
    scheduleIds: v.array(v.id('schedules')),
    startTime: v.optional(v.string()),
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

    for (const scheduleId of args.scheduleIds) {
      const shift = await ctx.db.get(scheduleId);
      if (!shift) {
        throw new ConvexError({ message: 'Shift not found' });
      }

      if (shift.status !== 'available') {
        throw new ConvexError({ message: 'Shift is not available' });
      }

      const assignment = await ctx.db.get(shift.assignmentId);
      if (!assignment) {
        throw new ConvexError({ message: 'Assignment not found' });
      }

      const hospice = await ctx.db.get(assignment.hospiceId);
      if (!hospice) {
        throw new ConvexError({ message: 'Hospice not found' });
      }

      const shifts = await ctx.db
        .query('schedules')
        .withIndex('nurse', (q) =>
          q.eq('nurseId', nurse._id).eq('status', 'booked')
        )
        .collect();

      // Parse the new shift's start and end datetime
      const newShiftStart = parseDateTime(shift.startDate, shift.startTime);
      const newShiftEnd = parseDateTime(shift.endDate, shift.endTime);

      // Check each existing shift for conflicts
      for (const shift of shifts) {
        // Parse existing shift's start and end datetime
        const existingShiftStart = parseDateTime(
          shift.startDate,
          shift.startTime
        );
        const existingShiftEnd = parseDateTime(shift.endDate, shift.endTime);

        // Check if the intervals overlap
        const hasConflict = doIntervalsOverlap(
          newShiftStart,
          newShiftEnd,
          existingShiftStart,
          existingShiftEnd
        );

        if (hasConflict) {
          throw new ConvexError({
            message: `You already have a shift from ${formatDate(shift.startDate)} ${shift.startTime} to ${formatDate(shift.endDate)} ${shift.endTime}`,
          });
        }
      }
      const notificationExists = await ctx.db
        .query('hospiceNotifications')
        .filter((q) =>
          q.and(
            q.eq(q.field('nurseId'), nurse._id),
            q.eq(q.field('type'), 'case_request'),
            q.eq(q.field('scheduleId'), scheduleId),

            q.neq(q.field('status'), 'declined')
          )
        )
        .first();

      if (notificationExists) {
        await ctx.db.delete(notificationExists._id);
      }

      await ctx.db.insert('hospiceNotifications', {
        isRead: false,
        hospiceId: assignment.hospiceId,
        nurseId: nurse._id,
        type: 'case_request',
        description: '',
        scheduleId: scheduleId,
        title: `${nurse.name} has submitted a case request for ${formatDate(shift.startDate)} to ${formatDate(shift.endDate)}: ${shift.startTime}-${shift.endTime}`,
        viewCount: 0,
      });
    }
  },
});
