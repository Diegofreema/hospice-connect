import { ConvexError, v } from 'convex/values';
import { type Id } from './_generated/dataModel';
import {
  mutation,
  type MutationCtx,
  query,
  type QueryCtx,
} from './_generated/server';
import {
  checkIfNurseHasActiveShift,
  deleteAllOtherHospiceNotificationsForThisSchedule,
  deleteAllOtherNotifications,
  formatDate,
  getRatings,
} from './helper';
import { scheduleStatus } from './schema';

export const cancelSchedule = mutation({
  args: {
    scheduleId: v.id('schedules'),
    hospiceId: v.id('hospices'),
    notificationId: v.optional(v.id('hospiceNotifications')),
    isCancelRequest: v.optional(v.boolean()),
    cancelledAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({ message: 'Unauthorized' });
    }
    const [hospice, schedule] = await Promise.all([
      ctx.db.get(args.hospiceId),
      ctx.db.get(args.scheduleId),
    ]);

    if (!hospice) throw new ConvexError({ message: 'Hospice not found' });
    if (!schedule) throw new ConvexError({ message: 'Shift not found' });

    if (!['booked', 'on_going'].includes(schedule.status)) {
      throw new ConvexError({ message: 'You cannot cancel this shift' });
    }

    const assignment = await ctx.db.get(schedule.assignmentId);
    if (!assignment) throw new ConvexError({ message: 'Assignment not found' });
    if (assignment.hospiceId !== args.hospiceId) {
      throw new ConvexError({
        message: 'You do not have permission to cancel this shift',
      });
    }

    // If no nurse is assigned, this shouldn't happen in valid state — but guard anyway
    if (!schedule.nurseId) {
      throw new ConvexError({
        message: 'Cannot cancel a shift with no assigned nurse',
      });
    }

    // === 4. Fetch nurse once (used in both branches) ===
    const nurse = await ctx.db.get(schedule.nurseId);
    if (!nurse) throw new ConvexError({ message: 'Assigned nurse not found' });

    // check if this is the only shift that this nurse is working on this assignment;
    const removeNurseAssignmentIfLastShift = async () => {
      const nurseAssignment = await ctx.db
        .query('nurseAssignments')
        .withIndex('assignmentId', (q) =>
          q.eq('assignmentId', schedule.assignmentId).eq('nurseId', nurse._id),
        )
        .first();
      if (nurseAssignment) {
        const schedules = await ctx.db
          .query('schedules')
          .withIndex('nurse_id', (q) =>
            q
              .eq('nurseId', nurseAssignment.nurseId)
              .eq('assignmentId', nurseAssignment.assignmentId),
          )
          .collect();
        const schedulesAfterFilter = schedules.filter(
          (s) => s._id !== schedule._id,
        );
        if (schedulesAfterFilter.length < 1) {
          await ctx.db.delete(nurseAssignment._id);
        }
      }
    };
    const isOngoing = schedule.status === 'on_going';
    const isCancelRequest = !!args.isCancelRequest;

    const notificationText = isCancelRequest
      ? 'accepted your shift cancel request'
      : 'cancelled your shift';

    const notificationTitle = isOngoing ? 'Shift cancelled' : 'Shift released';

    if (isOngoing) {
      // ON_GOING → CANCELLED
      await ctx.db.patch(args.scheduleId, {
        status: 'cancelled',
        canceledAt: args.cancelledAt,
      });
    } else {
      // BOOKED → AVAILABLE (nurse is removed)
      removeNurseAssignmentIfLastShift();
      await ctx.db.patch(args.scheduleId, {
        status: 'available',
        nurseId: undefined, // explicitly unassign
      });
    }

    // === 8. Send notification to nurse ===
    await ctx.db.insert('nurseNotifications', {
      nurseId: schedule.nurseId,
      isRead: false,
      hospiceId: args.hospiceId,
      scheduleId: args.scheduleId,
      title: notificationTitle,
      description: `${
        hospice.businessName
      } has ${notificationText} for ${formatDate(
        schedule.startDate,
      )} to ${formatDate(schedule.endDate)}; ${schedule.startTime} - ${
        schedule.endTime
      }.`,
      type: 'normal',
      viewCount: 0,
    });

    // === 9. If this was a response to a cancel request, mark it as accepted ===
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
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
    const shifts = await getSchedulesByAssignmentIdHelper(ctx, assignment._id);
    const lastShift = shifts[shifts.length - 1];
    if (lastShift._id === args.scheduleId) {
      await ctx.db.patch(assignment._id, {
        endDate: args.endDate,
      });
    }
    if (assignment.hospiceId !== args.hospiceId) {
      throw new ConvexError({
        message: 'You do not have permission to edit this schedule',
      });
    }
    // check if the new time is different from the old time, so we need to update the isTimeEdited flag
    const isTimeEdited =
      schedule.startTime !== args.startTime ||
      schedule.endTime !== args.endTime ||
      schedule.startDate !== args.startDate ||
      schedule.endDate !== args.endDate;

    await ctx.db.patch(args.scheduleId, {
      startDate: args.startDate,
      endDate: args.endDate,
      startTime: args.startTime,
      endTime: args.endTime,
      rate: args.rate,
      isTimeEdited,
      isEdited: true,
    });
  },
});

export const sendScheduleNotification = mutation({
  args: {
    scheduleIds: v.array(v.id('schedules')),
    hospiceId: v.id('hospices'),
    nurseId: v.id('nurses'),
    hospiceName: v.string(),
    isHospice: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
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
      await checkIfNurseHasActiveShift({
        ctx,
        nurseId: args.nurseId,
        hospiceTimezone: assignment.hospiceTimezone,
        shift: schedule,
        isHospice: args.isHospice,
      });

      await ctx.db.insert('nurseNotifications', {
        nurseId: args.nurseId,
        isRead: false,
        hospiceId: args.hospiceId,
        scheduleId: scheduleId,
        description: `${
          args.hospiceName
        } has assigned you a schedule for ${formatDate(
          schedule.startDate,
        )} to ${formatDate(schedule.endDate)}; ${schedule.startTime} - ${
          schedule.endTime
        }.`,
        title: 'Schedule assigned',
        type: 'assignment',
        viewCount: 0,
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
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
      description: `${
        args.hospiceName
      } has declined your shift cancel request for ${formatDate(
        schedule.startDate,
      )} to ${formatDate(schedule.endDate)}; ${schedule.startTime} - ${
        schedule.endTime
      }.`,
      title: 'Cancel request declined',
      type: 'normal',
      viewCount: 0,
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
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
      description: `${
        args.hospiceName
      } has declined your case request for ${formatDate(
        schedule.startDate,
      )} to ${formatDate(schedule.endDate)}; ${schedule.startTime} - ${
        schedule.endTime
      }.`,
      title: 'Case request declined',
      type: 'normal',
      viewCount: 0,
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
    reassignedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({ message: 'Unauthorized' });
    }
    const [nurse, schedule, notification, hospice] = await Promise.all([
      ctx.db.get(args.nurseId),
      ctx.db.get(args.scheduleId),
      ctx.db.get(args.notificationId),
      ctx.db.get(args.hospiceId),
    ]);
    if (!schedule) {
      throw new ConvexError({ message: 'Shift not found' });
    }

    if (schedule.status === 'not_covered') {
      throw new ConvexError({ message: 'Shift has already passed' });
    }

    if (!hospice) {
      throw new ConvexError({ message: 'Hospice not found' });
    }
    if (!notification) {
      throw new ConvexError({ message: 'Notification not found' });
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

    if (!nurse) {
      throw new ConvexError({ message: 'Nurse not found' });
    }
    // Check if the nurse is already assigned to the assignment
    const nurseAssignmentExists = await ctx.db
      .query('nurseAssignments')
      .withIndex('assignmentId', (q) =>
        q.eq('assignmentId', assignment._id).eq('nurseId', args.nurseId),
      )
      .first();
    // If not, create a new nurseAssignment
    if (!nurseAssignmentExists) {
      await ctx.db.insert('nurseAssignments', {
        isCompleted: false,
        nurseId: args.nurseId,
        assignmentId: assignment._id,
        isSubmitted: false,
      });
    }

    // disable all other case request for this shift
    await deleteAllOtherHospiceNotificationsForThisSchedule({
      ctx,
      scheduleId: args.scheduleId,
      hospiceNotificationId: args.notificationId,
      cursor: null,
      numItems: 10,
    });
    // sends notification to nurse, that the case request has been accepted
    await ctx.db.insert('nurseNotifications', {
      nurseId: args.nurseId,
      isRead: false,
      hospiceId: args.hospiceId,
      scheduleId: args.scheduleId,
      description: `${
        args.hospiceName
      } has approved your case request for ${formatDate(
        schedule.startDate,
      )} to ${formatDate(schedule.endDate)}; ${schedule.startTime} - ${
        schedule.endTime
      }.`,
      title: 'Case request accepted',
      type: 'normal',
      viewCount: 0,
    });
    // updates the notification status to accepted
    await ctx.db.patch(args.notificationId, {
      status: 'accepted',
    });
    // update the schedule status to booked

    if (notification.type === 'reassignment') {
      const { _creationTime, _id, ...rest } = schedule;
      await ctx.db.insert('schedules', {
        ...rest,
        canceledAt: args.reassignedAt,
        isReassigned: true,
        status: 'cancelled',
      });
      await ctx.db.insert('nurseNotifications', {
        hospiceId: assignment.hospiceId,
        nurseId: schedule.nurseId!,
        title: 'Schedule cancelled',
        description: `${
          hospice.businessName
        } has cancelled your schedule for  ${formatDate(
          schedule.startDate,
        )} to ${formatDate(schedule.endDate)}; ${schedule.startTime} - ${
          schedule.endTime
        }.`,
        type: 'normal',
        viewCount: 0,
        isRead: false,
      });
      await ctx.db.patch(schedule._id, {
        nurseId: args.nurseId,
        reassignedAt: args.reassignedAt,
      });
      await deleteAllOtherNotifications(
        ctx,
        args.nurseId,
        notification._id,
        args.scheduleId,
        'reassignment',
        args.hospiceId,
      );
    } else {
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
      await ctx.db.patch(args.scheduleId, {
        status: 'booked',
        nurseId: args.nurseId,
      });
    }
  },
});

// ! queries

export const getSchedule = query({
  args: {
    scheduleId: v.id('schedules'),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    return await ctx.db.get(args.scheduleId);
  },
});

export const updateScheduleStatus = mutation({
  args: {
    scheduleId: v.id('schedules'),
    status: scheduleStatus,
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
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
    const schedules = await getSchedulesByAssignmentIdHelper(
      ctx,
      assignment._id,
    );

    const lastSchedule = schedules[schedules.length - 1];
    if (lastSchedule._id === schedule._id) {
      if (args.status === 'not_covered') {
        await ctx.db.patch(assignment._id, {
          status: 'completed',
        });
      }
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
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
        q.eq('assignmentId', args.assignmentId).eq('status', 'available'),
      )
      .collect();
  },
});

export const getSchedulesByAssignmentId = query({
  args: {
    assignmentId: v.id('assignments'),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }
    return await ctx.db
      .query('schedules')
      .withIndex('by_assignment_id', (q) =>
        q.eq('assignmentId', args.assignmentId).eq('status', 'available'),
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
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

// helper

export const getSchedulesByAssignmentIdHelper = async (
  ctx: QueryCtx | MutationCtx,
  assignmentId: Id<'assignments'>,
) => {
  return await ctx.db
    .query('schedules')
    .filter((q) => q.eq(q.field('assignmentId'), assignmentId))
    .order('asc')
    .collect();
};
