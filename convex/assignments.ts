import { getAuthUserId } from '@convex-dev/auth/server';
import { filter } from 'convex-helpers/server/filter';
import { paginationOptsValidator, PaginationResult } from 'convex/server';
import { ConvexError, v } from 'convex/values';
import { Doc } from './_generated/dataModel';
import { mutation, query } from './_generated/server';
import { careLevel, discipline, gender, shifts } from './schema';
import { AssignmentsWithHospicesType, AvailableAssignmentType } from './types';

export const availableAssignments = query({
  args: {
    nurseId: v.id('nurses'),
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
      .withIndex('state', (q) => q.eq('state', nurse.stateOfRegistration))
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
    gender: gender,
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
      status: 'not_booked',
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
    gender: gender,
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
      status: 'not_booked',
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
