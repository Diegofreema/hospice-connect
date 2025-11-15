import { getAuthUserId } from '@convex-dev/auth/server';
import { paginationOptsValidator } from 'convex/server';
import { ConvexError, v } from 'convex/values';
import { mutation, query } from './_generated/server';
import {
  convertTimeStringToDate,
  doIntervalsOverlap,
  formatDate,
  parseDateTime,
  stringToDate,
} from './helper';
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
      .withIndex('by_hospice_id', (q) => q.eq('hospiceId', args.hospiceId))
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
export const markNotificationAsRead = mutation({
  args: {
    hospiceId: v.id('hospices'),
  },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query('hospiceNotifications')
      .withIndex('by_hospice_id', (q) =>
        q.eq('hospiceId', args.hospiceId).eq('isRead', false)
      )
      .take(100);

    for (const notification of notifications) {
      if (notification.type !== 'route_sheet') {
        if (!notification.isRead) {
          await ctx.db.patch(notification._id, { isRead: true });
        }
      }
    }
  },
});
export const markSingleNotificationAsRead = mutation({
  args: {
    notificationId: v.id('hospiceNotifications'),
  },
  handler: async (ctx, args) => {
    const notification = await ctx.db.get(args.notificationId);
    if (!notification) {
      return;
    }

    if (notification.isRead) {
      return;
    }

    await ctx.db.patch(notification._id, { isRead: true });
  },
});

export const cancelShiftNotification = mutation({
  args: {
    nurseId: v.id('nurses'),
    shiftId: v.id('schedules'),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
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
      title: `${nurse.firstName} ${nurse.lastName} submitted cancel request for ${formatDate(shift.startDate)} to ${formatDate(shift.endDate)}: ${shift.startTime}-${shift.endTime}`,
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
    const userId = await getAuthUserId(ctx);
    if (!userId) {
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
      const openingShift = convertTimeStringToDate(shift.startTime);
      const startDate = stringToDate(shift.startDate);
      const shiftStartDateTime = new Date(startDate as Date);
      shiftStartDateTime.setHours(
        openingShift.getHours(),
        openingShift.getMinutes(),
        0,
        0
      );
      // console.log({
      //   shiftStartDateTime,
      //   openingShift,
      //   startDate,
      //   local: shiftStartDateTime.toLocaleDateString(),
      //   shift: shift.startDate,
      // });
      const now = new Date();
      if (shiftStartDateTime < now) {
        throw new ConvexError({ message: 'Shift has already passed' });
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

      // Validate that end time is after start time
      if (newShiftEnd.getTime() <= newShiftStart.getTime()) {
        throw new ConvexError({
          message: 'End date/time must be after start date/time',
        });
      }

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
            message: `You already has a shift from ${formatDate(shift.startDate)} ${shift.startTime} to ${formatDate(shift.endDate)} ${shift.endTime}`,
          });
        }
      }
      await ctx.db.insert('hospiceNotifications', {
        isRead: false,
        hospiceId: assignment.hospiceId,
        nurseId: nurse._id,
        type: 'case_request',
        description: '',
        scheduleId: scheduleId,
        title: `${nurse.firstName} ${nurse.lastName} has submitted a case request for ${formatDate(shift.startDate)} to ${formatDate(shift.endDate)}: ${shift.startTime}-${shift.endTime}`,
      });
    }
  },
});
