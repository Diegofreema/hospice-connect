import { getAuthUserId } from '@convex-dev/auth/server';
import { filter } from 'convex-helpers/server/filter';
import { paginationOptsValidator, PaginationResult } from 'convex/server';
import { ConvexError, v } from 'convex/values';
import { Doc } from './_generated/dataModel';
import { mutation, query } from './_generated/server';
import { formatDateString, formatTimeString, stringToDate } from './helper';
import { careLevel, discipline, shifts } from './schema';
import { AssignmentsWithHospicesType, AvailableAssignmentType } from './types';

export const availableAssignments = query({
  args: {
    nurseId: v.id('nurses'),
    discipline: discipline,
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
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
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return {} as PaginationResult<Doc<'assignments'>>;
    }
    const nurse = await ctx.db
      .query('nurses')
      .withIndex('userId', (q) => q.eq('userId', userId))
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
    const schedules = await filter(
      ctx.db
        .query('schedules')
        .withIndex('nurse', (q) => q.eq('nurseId', nurse._id)),
      (schedule) => schedule.status === 'completed'
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
    const assignmentsWithHospices = await Promise.all(
      finalArray.map(async (assignment) => {
        const hospice = await ctx.db.get(assignment.hospiceId);
        return {
          ...assignment,
          hospice,
        };
      })
    );
    return {
      ...schedules,
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
  },
  handler: async (ctx, args) => {
    console.log({
      startDate: args.startDate,
      endDate: args.endDate,
      openShift: args.openShift,
    });

    const userId = await getAuthUserId(ctx);
    if (!userId) {
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
        description:
          'A new assignment matching your discipline has been posted.',
        title: 'New Assignment Available',
        type: 'normal',
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
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
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
          .eq('discipline', assignment.discipline)
          .eq('stateOfRegistration', assignment.state)
      )
      .collect();
    const assignmentId = await ctx.db.insert('assignments', {
      notes: assignment.notes,
      patientAddress: assignment.patientAddress,
      dateOfBirth: assignment.dateOfBirth,
      discipline: assignment.discipline,
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
        description:
          'A new assignment matching your discipline has been posted.',
        title: 'New Assignment Available',
        type: 'normal',
      });
    }
  },
});

export const getAssignment = query({
  args: {
    assignmentId: v.id('assignments'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    const assignment = await ctx.db.get(args.assignmentId);
    if (!assignment) {
      return null;
    }
    return assignment;
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
  },
  handler: async (ctx, { assignmentId, ...args }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
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
    });
  },
});

export const deleteAssignment = mutation({
  args: {
    assignmentId: v.id('assignments'),
    hospiceId: v.id('hospices'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
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

    await ctx.db.delete(args.assignmentId);
  },
});

export const updateAssignmentStatus = mutation({
  args: {
    assignmentId: v.id('assignments'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return;
    }
    const assignment = await ctx.db.get(args.assignmentId);
    if (!assignment) {
      return;
    }
    const schedules = await ctx.db
      .query('schedules')
      .withIndex('by_assignment_id', (q) =>
        q.eq('assignmentId', assignment._id)
      )
      .collect();

    const isFullyStaffed = schedules.every((schedule) => schedule.nurseId);
    const endDate = stringToDate(assignment.endDate);
    endDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const timeHasPassed = endDate <= today;

    if (isFullyStaffed && !timeHasPassed) {
      await ctx.db.patch(args.assignmentId, {
        status: 'booked',
      });
    }
    if (!isFullyStaffed && !timeHasPassed) {
      await ctx.db.patch(args.assignmentId, {
        status: 'completed',
      });
    }

    if (timeHasPassed) {
      await ctx.db.patch(args.assignmentId, {
        status: 'completed',
      });
    }
  },
});

export const cancelAssignment = mutation({
  args: {
    assignmentId: v.id('assignments'),
    hospiceId: v.id('hospices'),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
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
    if (assignment.hospiceId !== args.hospiceId) {
      throw new ConvexError({
        message: 'You do not have permission to cancel this assignment',
      });
    }

    const schedules = await ctx.db
      .query('schedules')
      .withIndex('by_assignment_id', (q) =>
        q.eq('assignmentId', args.assignmentId)
      )
      .collect();
    for (const schedule of schedules) {
      if (schedule.nurseId) {
        await ctx.db.insert('nurseNotifications', {
          nurseId: schedule.nurseId,
          isRead: false,
          hospiceId: args.hospiceId,
          scheduleId: schedule._id,
          description: args.reason,
          title: 'Assignment Cancelled',
          type: 'normal',
        });

        if (
          schedule.status !== 'completed' &&
          schedule.status !== 'not_covered'
        ) {
          await ctx.db.patch(schedule._id, {
            status: 'cancelled',
            canceledAt: Date.now(),
            endTime: formatTimeString(new Date()),
            endDate: formatDateString(new Date()),
          });
        }
      }

      if (schedule.status === 'available') {
        await ctx.db.patch(schedule._id, {
          status: 'cancelled',
        });
      }
    }
    await ctx.db.patch(assignment._id, {
      isCanceled: true,
      status: 'cancelled',
    });
  },
});
