import { getAuthUserId } from '@convex-dev/auth/server';
import { paginationOptsValidator } from 'convex/server';
import { ConvexError, v } from 'convex/values';
import { mutation, query } from './_generated/server';
import {
  convertTimeStringToDate,
  doIntervalsOverlap,
  parseDateTime,
  stringToDate,
} from './helper';
import { discipline } from './schema';

export const getOurPosts = query({
  args: {
    hospiceId: v.id('hospices'),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('assignments')
      .withIndex('hospiceId', (q) => q.eq('hospiceId', args.hospiceId))
      .order('desc')
      .paginate(args.paginationOpts);
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
    const userId = await getAuthUserId(ctx);
    if (!userId) {
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
    const user = await ctx.db.get(hospice.userId);
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

// ? mutations

export const acceptAssignment = mutation({
  args: {
    scheduleId: v.id('schedules'),
    nurseId: v.id('nurses'),
    nurseNotificationId: v.optional(v.id('nurseNotifications')),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError({ message: 'Unauthorized' });
    }
    const user = await ctx.db.get(userId);
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

    // logic to check if schedule time has passed
    const openingShift = convertTimeStringToDate(schedule.startTime);
    const startDate = stringToDate(schedule.startDate);
    const shiftStartDateTime = new Date(startDate as Date);
    shiftStartDateTime.setHours(
      openingShift.getHours(),
      openingShift.getMinutes(),
      0,
      0
    );

    const now = new Date();
    if (shiftStartDateTime < now) {
      throw new ConvexError({ message: 'Shift has already passed' });
    }
    if (schedule.status === 'not_covered') {
      throw new ConvexError({ message: 'Shift has already passed' });
    }

    if (schedule.status === 'booked') {
      throw new ConvexError({ message: 'Shift already booked' });
    }

    if (schedule.status === 'completed') {
      throw new ConvexError({ message: 'Shift already completed' });
    }

    if (schedule.nurseId) {
      throw new ConvexError({ message: 'Shift already accepted' });
    }

    await ctx.db.patch(args.scheduleId, {
      nurseId: args.nurseId,
      status: 'booked',
    });
    const shifts = await ctx.db
      .query('schedules')
      .withIndex('nurse', (q) =>
        q.eq('nurseId', args.nurseId).eq('status', 'booked')
      )
      .collect();

    // Parse the new shift's start and end datetime
    const newShiftStart = parseDateTime(schedule.startDate, schedule.startTime);
    const newShiftEnd = parseDateTime(schedule.endDate, schedule.endTime);

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
          message: `This nurse already has a shift from ${shift.startDate} ${shift.startTime} to ${shift.endDate} ${shift.endTime}`,
        });
      }
    }

    await ctx.db.insert('hospiceNotifications', {
      isRead: false,
      hospiceId: assignment.hospiceId,
      type: 'assignment',
      title: 'Shift accepted',
      scheduleId: args.scheduleId,
      description: `${user.name} has accepted your case request for ${schedule.startDate} - ${schedule.endDate}; ${schedule.startTime} - ${schedule.endTime}.`,
      nurseId: args.nurseId,
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
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError({ message: 'Unauthorized' });
    }
    const user = await ctx.db.get(userId);
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

    await ctx.db.patch(args.nurseNotificationId, {
      status: 'declined',
    });

    await ctx.db.insert('hospiceNotifications', {
      isRead: false,
      hospiceId: assignment.hospiceId,
      type: 'assignment',
      title: 'Assignment Declined',
      scheduleId: args.scheduleId,
      description: `${user.name} has declined your case request for ${schedule.startDate} - ${schedule.endDate}; ${schedule.startTime} - ${schedule.endTime}.`,
      nurseId: notification.nurseId,
    });
  },
});
