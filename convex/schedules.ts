import { getAuthUserId } from '@convex-dev/auth/server';
import { ConvexError, v } from 'convex/values';
import { mutation, query } from './_generated/server';
import {
  convertTimeStringToDate,
  doIntervalsOverlap,
  formatTimeString,
  getRatings,
  parseDateTime,
  stringToDate,
} from './helper';
import { scheduleStatus } from './schema';

export const cancelSchedule = mutation({
  args: {
    scheduleId: v.id('schedules'),
    hospiceId: v.id('hospices'),
    nurseId: v.id('nurses'),
    hospiceName: v.string(),
    notificationId: v.optional(v.id('hospiceNotifications')),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError({ message: 'Unauthorized' });
    }

    const schedule = await ctx.db.get(args.scheduleId);
    if (!schedule) {
      throw new ConvexError({ message: 'Shift not found' });
    }

    if (schedule.status !== 'booked') {
      throw new ConvexError({ message: 'You cannot cancel this schedule' });
    }

    const assignment = await ctx.db.get(schedule.assignmentId);
    if (!assignment) {
      throw new ConvexError({ message: 'Assignment not found' });
    }
    if (assignment.hospiceId !== args.hospiceId) {
      throw new ConvexError({
        message: 'You do not have permission to cancel this schedule',
      });
    }
    const { _id, _creationTime, ...rest } = schedule;
    await ctx.db.patch(args.scheduleId, {
      status: 'available',
      nurseId: undefined,
      canceledAt: Date.now(),
    });
    // creating clone schedule
    await ctx.db.insert('schedules', {
      ...rest,
      endTime: formatTimeString(new Date()),
      canceledAt: Date.now(),
    });

    const nurse = await ctx.db.get(args.nurseId);
    if (!nurse) {
      throw new ConvexError({ message: 'Nurse not found' });
    }
    await ctx.db.insert('nurseNotifications', {
      nurseId: args.nurseId,
      isRead: false,
      hospiceId: args.hospiceId,
      scheduleId: args.scheduleId,
      description: `${args.hospiceName} has Canceled your shift for ${schedule.startDate} - ${schedule.endDate}; ${schedule.startTime} - ${schedule.endTime}.`,
      title: 'Schedule cancelled',
      type: 'normal',
    });
    if (args.notificationId) {
      await ctx.db.patch(args.notificationId, {
        status: 'accepted',
      });
    }
  },
});

export const editSchedule = mutation({
  args: {
    startDate: v.string(),
    endDate: v.string(),
    startTime: v.string(),
    endTime: v.string(),
    scheduleId: v.id('schedules'),
    hospiceId: v.id('hospices'),
    rate: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new ConvexError({ message: 'Unauthorized' });
    }

    const schedule = await ctx.db.get(args.scheduleId);
    if (!schedule) {
      throw new ConvexError({ message: 'Schedule not found' });
    }

    const assignment = await ctx.db.get(schedule.assignmentId);
    if (!assignment) {
      throw new ConvexError({ message: 'Assignment not found' });
    }
    if (assignment.hospiceId !== args.hospiceId) {
      throw new ConvexError({
        message: 'You do not have permission to edit this schedule',
      });
    }

    await ctx.db.patch(args.scheduleId, {
      startDate: args.startDate,
      endDate: args.endDate,
      startTime: args.startTime,
      endTime: args.endTime,
      rate: args.rate,
    });
  },
});

export const sendScheduleNotification = mutation({
  args: {
    scheduleIds: v.array(v.id('schedules')),
    hospiceId: v.id('hospices'),
    nurseId: v.id('nurses'),
    hospiceName: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError({ message: 'Unauthorized' });
    }
    for (const scheduleId of args.scheduleIds) {
      const schedule = await ctx.db.get(scheduleId);
      if (!schedule) {
        throw new ConvexError({ message: 'Schedule not found' });
      }
      const assignment = await ctx.db.get(schedule.assignmentId);
      if (!assignment) {
        throw new ConvexError({ message: 'Assignment not found' });
      }
      if (assignment.hospiceId !== args.hospiceId) {
        throw new ConvexError({
          message: 'You do not have permission to assign this schedule',
        });
      }
      const shifts = await ctx.db
        .query('schedules')
        .withIndex('nurse', (q) =>
          q.eq('nurseId', args.nurseId).eq('status', 'booked')
        )
        .collect();

      // Parse the new shift's start and end datetime
      const newShiftStart = parseDateTime(
        schedule.startDate,
        schedule.startTime
      );
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

      await ctx.db.insert('nurseNotifications', {
        nurseId: args.nurseId,
        isRead: false,
        hospiceId: args.hospiceId,
        scheduleId: scheduleId,
        description: `${args.hospiceName} has assigned you a schedule for ${schedule.startDate} - ${schedule.endDate}; ${schedule.startTime} - ${schedule.endTime}.`,
        title: 'Schedule assigned',
        type: 'assignment',
      });
    }
  },
});

export const declineSchedule = mutation({
  args: {
    scheduleId: v.id('schedules'),
    hospiceId: v.id('hospices'),
    nurseId: v.id('nurses'),
    hospiceName: v.string(),
    notificationId: v.id('hospiceNotifications'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError({ message: 'Unauthorized' });
    }

    const schedule = await ctx.db.get(args.scheduleId);
    if (!schedule) {
      throw new ConvexError({ message: 'Shift not found' });
    }

    const assignment = await ctx.db.get(schedule.assignmentId);
    if (!assignment) {
      throw new ConvexError({ message: 'Assignment not found' });
    }
    if (assignment.hospiceId !== args.hospiceId) {
      throw new ConvexError({
        message: 'You do not have permission to decline this cancel request',
      });
    }

    const nurse = await ctx.db.get(args.nurseId);
    if (!nurse) {
      throw new ConvexError({ message: 'Nurse not found' });
    }
    await ctx.db.insert('nurseNotifications', {
      nurseId: args.nurseId,
      isRead: false,
      hospiceId: args.hospiceId,
      scheduleId: args.scheduleId,
      description: `${args.hospiceName} has declined your case cancel request for ${schedule.startDate} - ${schedule.endDate}; ${schedule.startTime} - ${schedule.endTime}.`,
      title: 'Cancel request declined',
      type: 'normal',
    });
    await ctx.db.patch(args.notificationId, {
      status: 'declined',
    });
  },
});
export const declineCaseRequest = mutation({
  args: {
    scheduleId: v.id('schedules'),
    hospiceId: v.id('hospices'),
    nurseId: v.id('nurses'),
    hospiceName: v.string(),
    notificationId: v.id('hospiceNotifications'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError({ message: 'Unauthorized' });
    }

    const schedule = await ctx.db.get(args.scheduleId);
    if (!schedule) {
      throw new ConvexError({ message: 'Shift not found' });
    }

    const assignment = await ctx.db.get(schedule.assignmentId);
    if (!assignment) {
      throw new ConvexError({ message: 'Assignment not found' });
    }
    if (assignment.hospiceId !== args.hospiceId) {
      throw new ConvexError({
        message: 'You do not have permission to decline this case request',
      });
    }

    const nurse = await ctx.db.get(args.nurseId);
    if (!nurse) {
      throw new ConvexError({ message: 'Nurse not found' });
    }
    await ctx.db.insert('nurseNotifications', {
      nurseId: args.nurseId,
      isRead: false,
      hospiceId: args.hospiceId,
      scheduleId: args.scheduleId,
      description: `${args.hospiceName} has declined your case request for ${schedule.startDate} - ${schedule.endDate}; ${schedule.startTime} - ${schedule.endTime}.`,
      title: 'Case request declined',
      type: 'normal',
    });
    await ctx.db.patch(args.notificationId, {
      status: 'declined',
    });
  },
});
export const acceptCaseRequest = mutation({
  args: {
    scheduleId: v.id('schedules'),
    hospiceId: v.id('hospices'),
    nurseId: v.id('nurses'),
    hospiceName: v.string(),
    notificationId: v.id('hospiceNotifications'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError({ message: 'Unauthorized' });
    }

    const schedule = await ctx.db.get(args.scheduleId);
    if (!schedule) {
      throw new ConvexError({ message: 'Shift not found' });
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
      throw new ConvexError({
        message: 'Shift already accepted by another nurse',
      });
    }

    const assignment = await ctx.db.get(schedule.assignmentId);
    if (!assignment) {
      throw new ConvexError({ message: 'Assignment not found' });
    }
    if (assignment.hospiceId !== args.hospiceId) {
      throw new ConvexError({
        message: 'You do not have permission to accept this case request',
      });
    }

    const nurse = await ctx.db.get(args.nurseId);
    if (!nurse) {
      throw new ConvexError({ message: 'Nurse not found' });
    }
    await ctx.db.insert('nurseNotifications', {
      nurseId: args.nurseId,
      isRead: false,
      hospiceId: args.hospiceId,
      scheduleId: args.scheduleId,
      description: `${args.hospiceName} Hope Hospice has approved your case request for ${schedule.startDate} - ${schedule.endDate}; ${schedule.startTime} - ${schedule.endTime}.
`,
      title: 'Case request accepted',
      type: 'normal',
    });
    await ctx.db.patch(args.notificationId, {
      status: 'accepted',
    });
    await ctx.db.patch(args.scheduleId, {
      status: 'booked',
      nurseId: args.nurseId,
    });
  },
});

// ! queries

export const getSchedule = query({
  args: {
    scheduleId: v.id('schedules'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError({ message: 'Unauthorized' });
    }
    const schedule = await ctx.db.get(args.scheduleId);
    if (!schedule) {
      throw new ConvexError({ message: 'Schedule not found' });
    }
    return schedule;
  },
});

export const updateScheduleStatus = mutation({
  args: {
    scheduleId: v.id('schedules'),
    status: scheduleStatus,
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError({ message: 'Unauthorized' });
    }
    const schedule = await ctx.db.get(args.scheduleId);
    if (!schedule) {
      throw new ConvexError({ message: 'Schedule not found' });
    }
    await ctx.db.patch(args.scheduleId, {
      status: args.status,
    });
  },
});

export const fetchAvailableSchedules = query({
  args: {
    assignmentId: v.id('assignments'),
    hospiceId: v.id('hospices'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }
    const assignment = await ctx.db.get(args.assignmentId);
    if (!assignment) {
      return [];
    }

    if (assignment.hospiceId !== args.hospiceId) {
      return [];
    }
    return await ctx.db
      .query('schedules')
      .withIndex('by_assignment_id', (q) =>
        q.eq('assignmentId', args.assignmentId).eq('status', 'available')
      )
      .collect();
  },
});

export const getSchedulesByAssignmentId = query({
  args: {
    assignmentId: v.id('assignments'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }
    return await ctx.db
      .query('schedules')
      .withIndex('by_assignment_id', (q) =>
        q.eq('assignmentId', args.assignmentId).eq('status', 'available')
      )
      .collect();
  },
});

export const getCaseRequest = query({
  args: {
    hospiceId: v.id('hospices'),
    nurseId: v.id('nurses'),
    scheduleId: v.id('schedules'),
    notificationId: v.id('hospiceNotifications'),
  },
  handler: async (ctx, args) => {
    const userId = getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError({ message: 'Unauthorized' });
    }

    const hospice = await ctx.db.get(args.hospiceId);
    if (!hospice) {
      throw new ConvexError({ message: 'Hospice not found' });
    }

    const schedule = await ctx.db.get(args.scheduleId);
    if (!schedule) {
      throw new ConvexError({ message: 'Schedule not found' });
    }

    const assignment = await ctx.db.get(schedule.assignmentId);
    if (!assignment) {
      throw new ConvexError({ message: 'Assignment not found' });
    }

    const nurse = await ctx.db.get(args.nurseId);
    if (!nurse) {
      throw new ConvexError({ message: 'Nurse not found' });
    }
    const notification = await ctx.db.get(args.notificationId);
    if (!notification) {
      throw new ConvexError({ message: 'Notification not found' });
    }
    const ratings = await getRatings(ctx, nurse._id);
    let nurseImage;

    if (nurse.imageId) {
      nurseImage = await ctx.storage.getUrl(nurse.imageId);
    }

    const nurseWithImage = {
      ...nurse,
      image: nurseImage,
      ratings,
    };

    return {
      assignment,
      nurse: nurseWithImage,
      schedule,
      notification,
    };
  },
});
