import { filter } from 'convex-helpers/server/filter';
import { paginationOptsValidator } from 'convex/server';
import { ConvexError, v } from 'convex/values';
import { query } from './_generated/server';
import { getAssignmentStatusDataHelper, getUserHelperFn } from './helper';

// Get all assignments
export const getAssignments = query({
  args: {
    status: v.optional(
      v.union(
        v.literal('completed'),
        v.literal('not_covered'),
        v.literal('booked'),
        v.literal('available'),
        v.literal('ended'),
        v.literal('all'),
      ),
    ),
    paginationOpts: paginationOptsValidator,
    searchQuery: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getUserHelperFn(ctx);
    if (user?.role !== 'admin' && user?.role !== 'super_admin') {
      throw new ConvexError({
        message: 'Only admin and super admin can access this data',
      });
    }
    const normalizedSearch = args.searchQuery?.trim().toLowerCase() ?? '';

    const assignments = await filter(
      ctx.db.query('assignments'),
      (assignment) => {
        const matchesSearch =
          !normalizedSearch ||
          assignment.patientFirstName
            .toLowerCase()
            .includes(normalizedSearch) ||
          assignment.patientLastName.toLowerCase().includes(normalizedSearch);
        const matchesStatus =
          args.status === 'all' || assignment.status === args.status;

        return matchesSearch && matchesStatus;
      },
    ).paginate(args.paginationOpts);

    const assignmentsWithHospiceInfo = await Promise.all(
      assignments.page.map(async (assignment) => {
        const hospice = await ctx.db.get('hospices', assignment.hospiceId);
        return {
          ...assignment,
          hospiceName: hospice?.businessName || 'N/A',
        };
      }),
    );
    return {
      ...assignments,
      page: assignmentsWithHospiceInfo,
    };
  },
});

// Get assignments by status
export const getAssignmentsByStatus = query({
  args: {
    status: v.union(
      v.literal('completed'),
      v.literal('not_covered'),
      v.literal('booked'),
      v.literal('available'),
      v.literal('ended'),
    ),
  },
  handler: async (ctx, args) => {},
});

// Update assignment status

// Get assignment statistics
export const getAssignmentStats = query({
  handler: async (ctx) => {
    const user = await getUserHelperFn(ctx);
    if (user?.role !== 'admin' && user?.role !== 'super_admin') {
      throw new ConvexError({
        message: 'Only admin and super admin can access this data',
      });
    }
    const stats = await getAssignmentStatusDataHelper(ctx);

    return {
      total: stats.totalAssignments,
      completed: stats.totalCompletedAssignments,
      ended: stats.totalEndedAssignments,
      active: stats.totalActiveAssignments,
    };
  },
});
