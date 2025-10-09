import { getAuthUserId } from '@convex-dev/auth/server';
import { ConvexError, v } from 'convex/values';
import { mutation, query } from './_generated/server';
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

    await ctx.db.patch(args.scheduleId, {
      status: 'available',
      nurseId: undefined,
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
      description: `${args.hospiceName} has cancelled your schedule.`,
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
    scheduleId: v.id('schedules'),
    hospiceId: v.id('hospices'),
    nurseId: v.id('nurses'),
    hospiceName: v.string(),
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
        message: 'You do not have permission to assign this schedule',
      });
    }

    await ctx.db.insert('nurseNotifications', {
      nurseId: args.nurseId,
      isRead: false,
      hospiceId: args.hospiceId,
      scheduleId: args.scheduleId,
      description: `${args.hospiceName} has assigned you a schedule.`,
      title: 'Schedule assigned',
      type: 'assignment',
    });
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
      description: `${args.hospiceName} has declined your cancel request.`,
      title: 'Cancel request declined',
      type: 'normal',
    });
    await ctx.db.patch(args.notificationId, {
      status: 'declined',
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
