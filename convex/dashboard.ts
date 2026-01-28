import { ConvexError } from 'convex/values';
import { query } from './_generated/server';

import {
  getActiveAssignmentsCount,
  getApproveHospiceCount,
  getApproveNurseCount,
  getAssignmentsCount,
  getCompletedAssignmentsCount,
  getEndedAssignmentsCount,
  getHospiceCount,
  getNurseCount,
  getPendingHospiceApprovalCount,
  getPendingNurseApprovalCount,
  getSuspendedHospicesCount,
  getSuspendedNursesCount,
} from './counter';
import {
  getUserHelperFn,
  listNursesAndHospicesWithinLast30Days,
} from './helper';
// Get dashboard statistics
export const getDashboardStats = query({
  handler: async (ctx) => {
    const user = await getUserHelperFn(ctx);
    if (user?.role !== 'admin' && user?.role !== 'super_admin') {
      throw new ConvexError({
        message: 'Only admin and super admin can access this data',
      });
    }

    // Get recent activity (last 30 days)
    const { recentNurses, recentHospices } =
      await listNursesAndHospicesWithinLast30Days(ctx);

    return {
      nurses: {
        total: await getNurseCount(ctx),
        approved: await getApproveNurseCount(ctx),
        suspended: await getSuspendedNursesCount(ctx),
        pending: await getPendingNurseApprovalCount(ctx),
        recentlyCreated: recentNurses.length,
      },
      hospices: {
        total: await getHospiceCount(ctx),
        approved: await getApproveHospiceCount(ctx),
        suspended: await getSuspendedHospicesCount(ctx),
        pending: await getPendingHospiceApprovalCount(ctx),
        recentlyCreated: recentHospices.length,
      },
      assignments: {
        total: await getAssignmentsCount(ctx),
        completed: await getCompletedAssignmentsCount(ctx),
        ended: await getEndedAssignmentsCount(ctx),
        active: await getActiveAssignmentsCount(ctx),
      },
    };
  },
});

// Get chart data for new accounts over time
export const getNewAccountsChartData = query({
  handler: async (ctx) => {
    const user = await getUserHelperFn(ctx);
    if (user?.role !== 'admin' && user?.role !== 'super_admin') {
      throw new ConvexError({
        message: 'Only admin and super admin can access this data',
      });
    }
    const now = Date.now();
    const { recentNurses, recentHospices } =
      await listNursesAndHospicesWithinLast30Days(ctx);

    // Group by day
    const chartData: Record<
      string,
      {
        date: string;
        nurses: number;
        hospices: number;
      }
    > = {};

    // Initialize last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      chartData[dateStr] = { date: dateStr, nurses: 0, hospices: 0 };
    }

    recentNurses.forEach((nurse) => {
      const dateStr = new Date(nurse._creationTime).toISOString().split('T')[0];
      if (chartData[dateStr]) {
        chartData[dateStr].nurses++;
      }
    });

    recentHospices.forEach((hospice) => {
      const dateStr = new Date(hospice._creationTime)
        .toISOString()
        .split('T')[0];
      if (chartData[dateStr]) {
        chartData[dateStr].hospices++;
      }
    });

    return Object.values(chartData);
  },
});

// Get assignment status distribution
export const getAssignmentStatusData = query({
  handler: async (ctx) => {
    const user = await getUserHelperFn(ctx);
    if (user?.role !== 'admin' && user?.role !== 'super_admin') {
      throw new ConvexError({
        message: 'Only admin and super admin can access this data',
      });
    }

    const statusCounts = {
      total: await getAssignmentsCount(ctx),
      completed: await getCompletedAssignmentsCount(ctx),
      ended: await getEndedAssignmentsCount(ctx),
    };

    return [
      { status: 'Total', count: statusCounts.total },
      { status: 'Ended', count: statusCounts.ended },
      { status: 'Completed', count: statusCounts.completed },
    ];
  },
});
