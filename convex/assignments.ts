import { getAuthUserId } from '@convex-dev/auth/server';
import { filter } from 'convex-helpers/server/filter';
import { paginationOptsValidator, PaginationResult } from 'convex/server';
import { ConvexError, v } from 'convex/values';
import { Doc, Id } from './_generated/dataModel';
import { mutation, query } from './_generated/server';
import { parseDateTimeWallClock } from './actionHelper';
import {
  checkIfNotificationHasBeenSentBeforeAndNotInteractedWith,
  checkIfNurseHasActiveShift,
  formatDate,
} from './helper';
import { getSchedulesByAssignmentIdHelper } from './schedules';
import { careLevel, discipline, shifts } from './schema';
import { AssignmentsWithHospicesType, AvailableAssignmentType } from './types';
import { getUserHelper } from './users';

export const availableAssignments = query({
  args: {
    nurseId: v.id('nurses'),
    discipline: discipline,
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return {} as PaginationResult<AvailableAssignmentType>;
    }

    const nurse = await ctx.db.get(args.nurseId);
    if (!nurse) {
      return {} as PaginationResult<AvailableAssignmentType>;
    }
    const result = await ctx.db
      .query('assignments')
      .withIndex('state', (q) =>
        q
          .eq('state', nurse.stateOfRegistration)
          .eq('status', 'available')
          .eq('discipline', args.discipline)
      )
      .paginate(args.paginationOpts);
    // ? getting schedules by assignment id
    const assignments = await Promise.all(
      result.page.map(async (assignment) => {
        const schedules = await ctx.db
          .query('schedules')
          .withIndex('by_assignment_id', (q) =>
            q.eq('assignmentId', assignment._id)
          )
          .collect();
        const hospice = await ctx.db.get(assignment.hospiceId);
        return {
          ...assignment,
          schedules,
          hospice,
        };
      })
    );
    // ? filtering to return only assignments that all their shifts are available
    const availableAssignments = assignments.filter(
      (assignment) =>
        assignment.schedules.length > 0 &&
        assignment.schedules.some((sch) => sch.status === 'available')
    );

    return {
      ...result,
      page: availableAssignments,
    };
  },
});
export const inProgressAssignments = query({
  args: {
    status: v.union(
      v.literal('completed'),
      v.literal('not_covered'),
      v.literal('booked'),
      v.literal('available')
    ),
    paginationOpts: paginationOptsValidator,
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getUserHelper(ctx, args.userId);
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return {} as PaginationResult<Doc<'assignments'>>;
    }
    if (!user) {
      return {} as PaginationResult<Doc<'assignments'>>;
    }
    const nurse = await ctx.db
      .query('nurses')
      .withIndex('userId', (q) => q.eq('userId', user._id))
      .first();
    if (!nurse) {
      return {} as PaginationResult<Doc<'assignments'>>;
    }
    const schedules = await filter(
      ctx.db
        .query('schedules')
        .withIndex('nurse', (q) => q.eq('nurseId', nurse._id)),
      (schedule) => schedule.status !== 'completed'
    ).paginate(args.paginationOpts);

    const schedulesWithUniqueAssignments = await Promise.all(
      schedules.page.map(async (schedule) => {
        return (await ctx.db.get(schedule.assignmentId)) as Doc<'assignments'>;
      })
    );

    const uniqueMap = new Map();
    schedulesWithUniqueAssignments.forEach((assignment) => {
      if (!uniqueMap.has(assignment._id)) {
        uniqueMap.set(assignment._id, assignment);
      }
    });

    const finalArray: Doc<'assignments'>[] = Array.from(uniqueMap.values());

    return {
      ...schedules,
      page: finalArray,
    };
  },
});
export const completedAssignments = query({
  args: {
    nurseId: v.id('nurses'),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return {} as PaginationResult<AssignmentsWithHospicesType>;
    }
    const nurse = await ctx.db.get(args.nurseId);
    if (!nurse) {
      return {} as PaginationResult<AssignmentsWithHospicesType>;
    }

    const completedNurseAssignments = await ctx.db
      .query('nurseAssignments')
      .withIndex('nurse_id', (q) =>
        q.eq('nurseId', nurse._id).eq('isCompleted', true)
      )
      // .filter((q) => q.eq(q.field('endDate'), nurse.stateOfRegistration))
      .paginate(args.paginationOpts);
    const sortedCompletedNurseAssignments = completedNurseAssignments.page.sort(
      (a, b) => {
        const dateA = new Date(a._creationTime);
        const dateB = new Date(b._creationTime);
        return dateB.getTime() - dateA.getTime();
      }
    );

    const assignments = await Promise.all(
      sortedCompletedNurseAssignments.map(async (nurseAssignment) => {
        const routeSheet = await ctx.db
          .query('routeSheets')
          .withIndex('by_assignment_id', (q) =>
            q
              .eq('assignmentId', nurseAssignment.assignmentId)
              .eq('nurseId', nurseAssignment.nurseId)
          )
          .filter((q) => q.neq(q.field('isDeclined'), true))
          .first();
        const isSubmitted = !!routeSheet;
        const assignment = (await ctx.db.get(
          nurseAssignment.assignmentId
        )) as Doc<'assignments'>;
        return {
          ...assignment,
          isSubmitted,
          isApproved: !!routeSheet?.isApproved,
        };
      })
    );

    const assignmentsWithHospices = await Promise.all(
      assignments.map(async (assignment) => {
        const hospice = await ctx.db.get(assignment.hospiceId);
        return {
          ...assignment,
          hospice,
        };
      })
    );

    return {
      ...completedNurseAssignments,
      page: assignmentsWithHospices,
    };
  },
});

export const createAssignment = mutation({
  args: {
    additionalNotes: v.optional(v.string()),
    address: v.string(),
    dateOfBirth: v.string(),
    discipline: discipline,
    endDate: v.string(),
    firstName: v.string(),
    gender: v.string(),
    lastName: v.string(),
    phoneNumber: v.string(),
    rate: v.number(),
    startDate: v.string(),
    state: v.string(),
    openShift: v.string(),
    hospiceId: v.id('hospices'),
    careLevel: careLevel,
    shifts: v.array(shifts),
    zipcode: v.string(),
    hospiceTimezone: v.string(),
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
    const nurses = await ctx.db
      .query('nurses')
      .withIndex('by_discipline', (q) =>
        q
          .eq('discipline', args.discipline)
          .eq('stateOfRegistration', args.state)
      )
      .collect();
    const assignmentId = await ctx.db.insert('assignments', {
      notes: args.additionalNotes,
      patientAddress: args.address,
      dateOfBirth: args.dateOfBirth,
      discipline: args.discipline,
      endDate: args.endDate,
      patientFirstName: args.firstName,
      gender: args.gender,
      patientLastName: args.lastName,
      phoneNumber: args.phoneNumber,
      rate: args.rate,
      startDate: args.startDate,
      state: args.state,
      openShift: args.openShift,
      hospiceId: args.hospiceId,
      status: 'available',
      careLevel: args.careLevel,
      zipcode: args.zipcode,
      hospiceTimezone: args.hospiceTimezone,
    });

    for (const shift of args.shifts) {
      await ctx.db.insert('schedules', {
        assignmentId: assignmentId,
        endDate: shift.end,
        endTime: shift.endShift,
        startDate: shift.start,
        startTime: shift.startShift,
        rate: args.rate,
        status: 'available',
        isSubmitted: false,
      });
    }

    for (const nurse of nurses) {
      await ctx.db.insert('nurseNotifications', {
        nurseId: nurse._id,
        isRead: false,
        description: `A new assignment matching your discipline has been posted by ${hospice.businessName}.`,
        title: 'New Assignment Available',
        type: 'normal',
        hospiceId: args.hospiceId,
        viewCount: 0,
      });
    }
  },
});

export const reopenAssignment = mutation({
  args: {
    endDate: v.string(),
    startDate: v.string(),
    openShift: v.string(),
    hospiceId: v.id('hospices'),
    shifts: v.array(shifts),
    assignmentId: v.id('assignments'),
    discipline: discipline,
    hospiceTimezone: v.string(),
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
    const assignment = await ctx.db.get(args.assignmentId);
    if (!assignment) {
      throw new ConvexError({ message: 'Assignment not found' });
    }
    const nurses = await ctx.db
      .query('nurses')
      .withIndex('by_discipline', (q) =>
        q
          .eq('discipline', args.discipline)
          .eq('stateOfRegistration', assignment.state)
      )
      .collect();
    const assignmentId = await ctx.db.insert('assignments', {
      notes: assignment.notes,
      patientAddress: assignment.patientAddress,
      dateOfBirth: assignment.dateOfBirth,
      discipline: args.discipline,
      endDate: args.endDate,
      patientFirstName: assignment.patientFirstName,
      gender: assignment.gender,
      patientLastName: assignment.patientLastName,
      phoneNumber: assignment.phoneNumber,
      rate: assignment.rate,
      startDate: args.startDate,
      state: assignment.state,
      openShift: args.openShift,
      hospiceId: args.hospiceId,
      status: 'available',
      careLevel: assignment.careLevel,
      zipcode: assignment.zipcode,
      hospiceTimezone: args.hospiceTimezone,
    });

    for (const shift of args.shifts) {
      await ctx.db.insert('schedules', {
        assignmentId: assignmentId,
        endDate: shift.end,
        endTime: shift.endShift,
        startDate: shift.start,
        startTime: shift.startShift,
        rate: assignment.rate,
        status: 'available',
        isSubmitted: false,
      });
    }
    for (const nurse of nurses) {
      await ctx.db.insert('nurseNotifications', {
        nurseId: nurse._id,
        isRead: false,
        description: `A new assignment matching your discipline has been posted by ${hospice.businessName}.`,
        title: 'New Assignment Available',
        type: 'normal',
        hospiceId: args.hospiceId,
        viewCount: 0,
      });
    }
  },
});

export const getAssignment = query({
  args: {
    assignmentId: v.id('assignments'),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    const assignment = await ctx.db.get(args.assignmentId);
    if (!assignment) {
      return null;
    }

    const schedules = await ctx.db
      .query('schedules')
      .withIndex('by_assignment_id', (q) =>
        q.eq('assignmentId', args.assignmentId)
      )
      .collect();

    const hasNurses = schedules.some((schedule) => schedule.nurseId);

    return {
      ...assignment,
      hasNurses,
    };
  },
});

export const updateAssignment = mutation({
  args: {
    additionalNotes: v.optional(v.string()),
    address: v.string(),
    dateOfBirth: v.string(),
    discipline: discipline,
    endDate: v.string(),
    firstName: v.string(),
    gender: v.string(),
    lastName: v.string(),
    phoneNumber: v.string(),
    rate: v.number(),
    startDate: v.string(),
    state: v.string(),
    openShift: v.string(),
    hospiceId: v.id('hospices'),
    careLevel: careLevel,
    assignmentId: v.id('assignments'),
    shifts: v.array(shifts),
    zipcode: v.string(),
  },
  handler: async (ctx, { assignmentId, ...args }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({ message: 'Unauthorized' });
    }
    const hospice = await ctx.db.get(args.hospiceId);
    if (!hospice) {
      throw new ConvexError({ message: 'Hospice not found' });
    }
    const assignment = await ctx.db.get(assignmentId);
    if (!assignment) {
      return new ConvexError({ message: 'Assignment not found' });
    }
    if (assignment.hospiceId !== args.hospiceId) {
      throw new ConvexError({
        message: 'You not permitted to update this assignment',
      });
    }

    if (args.discipline !== assignment.discipline) {
      const nurses = await ctx.db
        .query('nurses')
        .withIndex('by_discipline', (q) =>
          q
            .eq('discipline', args.discipline)
            .eq('stateOfRegistration', args.state)
        )
        .collect();
      for (const nurse of nurses) {
        await ctx.db.insert('nurseNotifications', {
          nurseId: nurse._id,
          isRead: false,
          description: `A new assignment matching your discipline has been posted by ${hospice.businessName}.`,
          title: 'New Assignment Available',
          type: 'normal',
          hospiceId: args.hospiceId,
          viewCount: 0,
        });
      }
    }
    const oldSchedules = await ctx.db
      .query('schedules')
      .withIndex('by_assignment_id', (q) => q.eq('assignmentId', assignmentId))
      .collect();
    const oldSchedulesHasNurse = oldSchedules.some(
      (schedule) => schedule.nurseId
    );
    if (oldSchedulesHasNurse) {
      await ctx.db.patch(assignmentId, {
        notes: args.additionalNotes,
        patientAddress: args.address,
        dateOfBirth: args.dateOfBirth,
        discipline: args.discipline,

        patientFirstName: args.firstName,
        gender: args.gender,
        patientLastName: args.lastName,
        phoneNumber: args.phoneNumber,
        rate: args.rate,

        state: args.state,
        openShift: args.openShift,
        hospiceId: args.hospiceId,
        status: 'available',
        careLevel: args.careLevel,
        zipcode: args.zipcode,
      });
    } else {
      await ctx.db.patch(assignmentId, {
        notes: args.additionalNotes,
        patientAddress: args.address,
        dateOfBirth: args.dateOfBirth,
        discipline: args.discipline,
        endDate: args.endDate,
        patientFirstName: args.firstName,
        gender: args.gender,
        patientLastName: args.lastName,
        phoneNumber: args.phoneNumber,
        rate: args.rate,
        startDate: args.startDate,
        state: args.state,
        openShift: args.openShift,
        hospiceId: args.hospiceId,
        status: 'available',
        careLevel: args.careLevel,
        zipcode: args.zipcode,
      });
      // ? deleting old schedules

      for (const schedule of oldSchedules) {
        await ctx.db.delete(schedule._id);
      }

      for (const shift of args.shifts) {
        await ctx.db.insert('schedules', {
          assignmentId: assignmentId,
          endDate: shift.end,
          endTime: shift.endShift,
          startDate: shift.start,
          startTime: shift.startShift,
          rate: args.rate,
          status: 'available',
          isSubmitted: false,
        });
      }
    }
  },
});

export const deleteAssignment = mutation({
  args: {
    assignmentId: v.id('assignments'),
    hospiceId: v.id('hospices'),
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
    const assignment = await ctx.db.get(args.assignmentId);

    if (!assignment) {
      throw new ConvexError({ message: 'Assignment not found' });
    }

    // if (assignment.status !== 'not_booked') {
    //   throw new ConvexError({ message: 'This assignment cannot be deleted' });
    // }
    if (assignment.hospiceId !== args.hospiceId) {
      throw new ConvexError({
        message: 'You do not have permission to delete this assignment',
      });
    }

    const schedules = await ctx.db
      .query('schedules')
      .withIndex('by_assignment_id', (q) =>
        q.eq('assignmentId', args.assignmentId)
      )
      .collect();
    const assignmentHasStarted = schedules.some((schedule) => {
      return schedule.nurseId;
    });

    if (assignmentHasStarted) {
      throw new ConvexError({ message: 'Assignment has already started' });
    }
    for (const schedule of schedules) {
      await ctx.db.delete(schedule._id);
    }

    await ctx.db.delete(args.assignmentId);
  },
});

export const updateAssignmentStatus = mutation({
  args: {
    assignmentId: v.id('assignments'),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return;
    }
    const assignment = await ctx.db.get(args.assignmentId);
    if (!assignment) {
      return;
    }
    if (['cancelled', 'ended'].includes(assignment.status)) {
      return;
    }

    const schedules = await getSchedulesByAssignmentIdHelper(
      ctx,
      args.assignmentId
    );
    // console.log({ first: schedules[0], last: schedules.at(-1) });

    type Status =
      | 'completed'
      | 'not_covered'
      | 'booked'
      | 'available'
      | 'ended';

    let newStatus: Status | undefined;

    if (schedules.length > 0) {
      const now = new Date();
      const wallClockNow = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        now.getHours(),
        now.getMinutes(),
        0,
        0
      );

      const lastEndTime = Math.max(
        ...schedules.map((s) =>
          parseDateTimeWallClock(
            s.endDate,
            s.endTime,
            assignment.hospiceTimezone
          ).getTime()
        )
      );
      const hasPassed = wallClockNow.getTime() > lastEndTime;
      const hasAvailable = schedules.some((s) => s.status === 'available');
      const hasBooked = schedules.some((s) =>
        ['booked', 'on_going'].includes(s.status)
      );

      if (hasPassed && !hasBooked) {
        newStatus = 'completed';
      } else if (hasAvailable) {
        newStatus = 'available';
      } else if (hasBooked) {
        newStatus = 'booked';
      }

      if (newStatus && newStatus !== assignment.status) {
        await ctx.db.patch(args.assignmentId, { status: newStatus });
      }
      if (newStatus === 'completed' || newStatus === 'ended') {
        const nursesAssignments = await ctx.db
          .query('nurseAssignments')
          .withIndex('assignmentId', (q) =>
            q.eq('assignmentId', args.assignmentId)
          )
          .collect();
        for (const nurseAssignment of nursesAssignments) {
          await ctx.db.patch(nurseAssignment._id, {
            isCompleted: true,
            completedAt: Date.now(),
          });
        }
      }
    }
  },
});

export const cancelAssignment = mutation({
  args: {
    assignmentId: v.id('assignments'),
    hospiceId: v.id('hospices'),
    reason: v.string(),

    cancelledAt: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({ message: 'Unauthorized' });
    }

    const hospice = await ctx.db.get(args.hospiceId);
    if (!hospice) throw new ConvexError({ message: 'Hospice not found' });

    const assignment = await ctx.db.get(args.assignmentId);
    if (!assignment) throw new ConvexError({ message: 'Assignment not found' });
    if (assignment.hospiceId !== args.hospiceId) {
      throw new ConvexError({ message: 'Permission denied' });
    }

    const schedules = await ctx.db
      .query('schedules')
      .withIndex('by_assignment_id', (q) =>
        q.eq('assignmentId', args.assignmentId)
      )
      .collect();

    if (schedules.length === 0) {
      // Maybe just mark assignment as cancelled
      await ctx.db.patch(assignment._id, {
        isCanceled: true,
        status: 'ended',
        canceledAt: args.cancelledAt,
      });
      return;
    }

    const text = `${hospice.businessName} has ended the assignment for ${assignment.patientFirstName} ${assignment.patientLastName}. Reason: ${args.reason || 'No reason provided'}`;

    // === Step 1: Send ONE notification per nurse ===
    const notifiedNurses = new Set<string>();

    for (const schedule of schedules) {
      if (schedule.nurseId && !notifiedNurses.has(schedule.nurseId)) {
        notifiedNurses.add(schedule.nurseId);

        await ctx.db.insert('nurseNotifications', {
          nurseId: schedule.nurseId as Id<'nurses'>,
          isRead: false,
          hospiceId: args.hospiceId,
          scheduleId: schedule._id,
          description: text,
          title: 'Assignment Ended',
          type: 'normal',
          viewCount: 0,
        });
      }
    }

    // === Step 2: Cancel ALL schedules (including 'on_going') ===
    const cancellableStatuses = new Set(['available', 'on_going', 'booked']);

    for (const schedule of schedules) {
      if (cancellableStatuses.has(schedule.status)) {
        await ctx.db.patch(schedule._id, {
          status: 'ended',
          canceledAt: args.cancelledAt,
        });
      }
    }
    const allNursesAssignment = await ctx.db
      .query('nurseAssignments')
      .withIndex('assignmentId', (q) => q.eq('assignmentId', args.assignmentId))
      .collect();
    for (const nurseAssignment of allNursesAssignment) {
      await ctx.db.patch(nurseAssignment._id, {
        isCompleted: true,
        completedAt: args.cancelledAt,
      });
    }
    // === Step 3: Update assignment ===
    await ctx.db.patch(assignment._id, {
      isCanceled: true,
      status: 'ended',
      canceledAt: args.cancelledAt,
    });
  },
});

export const reassignShift = mutation({
  args: {
    shift: v.id('schedules'),
    newNurseId: v.id('nurses'),
    assignedAt: v.number(),
    assignmentId: v.id('assignments'),
    notificationId: v.id('nurseNotifications'),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({ message: 'Unauthorized' });
    }
    const [nurse, assignment, schedule, notification] = await Promise.all([
      ctx.db.get(args.newNurseId),
      ctx.db.get(args.assignmentId),
      ctx.db.get(args.shift),
      ctx.db.get(args.notificationId),
    ]);
    if (!nurse) throw new ConvexError({ message: 'Nurse not found' });
    if (!assignment) throw new ConvexError({ message: 'Assignment not found' });
    if (!schedule) throw new ConvexError({ message: 'Schedule not found' });
    if (!notification)
      throw new ConvexError({ message: 'Notification not found' });
    if (schedule.status !== 'on_going') {
      throw new ConvexError({ message: 'Can only reassign on-going schedule' });
    }
    if (assignment.status === 'ended')
      throw new ConvexError({ message: 'Assignment is ended' });

    const hospice = await ctx.db.get(assignment.hospiceId);
    if (!hospice) {
      throw new ConvexError({ message: 'Hospice not found' });
    }
    await checkIfNurseHasActiveShift({
      ctx,
      nurseId: args.newNurseId,
      hospiceTimezone: assignment.hospiceTimezone,
      shift: schedule,
    });
    const { _creationTime, _id, ...rest } = schedule;
    await ctx.db.insert('schedules', {
      ...rest,
      canceledAt: args.assignedAt,
      isReassigned: true,
      status: 'cancelled',
    });
    await ctx.db.insert('nurseNotifications', {
      hospiceId: assignment.hospiceId,
      nurseId: schedule.nurseId!,
      title: 'Schedule cancelled',
      description: `${hospice.businessName} has cancelled your schedule for  ${formatDate(schedule.startDate)} to ${formatDate(schedule.endDate)}; ${schedule.startTime} - ${schedule.endTime}.`,
      type: 'normal',
      viewCount: 0,
      isRead: false,
    });
    await ctx.db.patch(schedule._id, {
      nurseId: args.newNurseId,
      reassignedAt: args.assignedAt,
    });
    await ctx.db.insert('hospiceNotifications', {
      isRead: false,
      hospiceId: assignment.hospiceId,
      type: 'assignment',
      title: 'Schedule accepted',
      scheduleId: args.shift,
      description: `${nurse.name} (${nurse.discipline}) has accepted your case request for ${formatDate(schedule.startDate)} to ${formatDate(schedule.endDate)}; ${schedule.startTime} - ${schedule.endTime}.`,
      nurseId: args.newNurseId,
      viewCount: 0,
    });
    await ctx.db.patch(args.notificationId, {
      status: 'accepted',
    });
  },
});

export const sendReassignmentNotification = mutation({
  args: {
    scheduleId: v.id('schedules'),
    hospiceId: v.id('hospices'),
    nurseId: v.id('nurses'),
    hospiceName: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({ message: 'Unauthorized' });
    }
    console.log({ id: args.nurseId });

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
    await checkIfNurseHasActiveShift({
      ctx,
      nurseId: args.nurseId,
      hospiceTimezone: assignment.hospiceTimezone,
      shift: schedule,
    });
    const alreadySentNotification =
      await checkIfNotificationHasBeenSentBeforeAndNotInteractedWith(
        ctx,
        args.nurseId,
        schedule._id,
        'reassignment'
      );
    if (alreadySentNotification) {
      await ctx.db.delete(alreadySentNotification._id);
    }
    await ctx.db.insert('nurseNotifications', {
      nurseId: args.nurseId,
      isRead: false,
      hospiceId: args.hospiceId,
      scheduleId: schedule._id,
      description: `${args.hospiceName} has assigned you a schedule for ${formatDate(schedule.startDate)} to ${formatDate(schedule.endDate)}; ${schedule.startTime} - ${schedule.endTime}.`,
      title: 'Schedule assigned',
      type: 'reassignment',
      viewCount: 0,
    });
  },
});
