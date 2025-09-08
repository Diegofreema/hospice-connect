import { getAuthUserId } from '@convex-dev/auth/server';
import { filter } from 'convex-helpers/server/filter';
import { paginationOptsValidator, PaginationResult } from 'convex/server';
import { v } from 'convex/values';
import { Doc } from './_generated/dataModel';
import { query } from './_generated/server';

export const availableAssignments = query({
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
    const result = await ctx.db
      .query('assignments')
      .withIndex('state', (q) =>
        q.eq('state', nurse.stateOfRegistration).eq('status', args.status)
      )
      .paginate(args.paginationOpts);

    return result;
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

    return {
      ...schedules,
      page: finalArray,
    };
  },
});
