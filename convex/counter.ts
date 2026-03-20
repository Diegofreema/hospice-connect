import { ShardedCounter } from '@convex-dev/sharded-counter';
import { components } from './_generated/api';
import { type MutationCtx, type QueryCtx } from './_generated/server';

const counter = new ShardedCounter(components.shardedCounter);

const nurseCount = counter.for('nurseCount');
const approvedNurseCount = counter.for('approvedNurseCount');
const hospiceCount = counter.for('hospiceCount');
const approvedHospiceCount = counter.for('approvedHospiceCount');
const suspendedNursesCount = counter.for('suspendedNursesCount');
const suspendedHospicesCount = counter.for('suspendedHospicesCount');
const pendingNurseApprovalCount = counter.for('pendingNurseApprovalCount');
const pendingHospiceApprovalCount = counter.for('pendingHospiceApprovalCount');
export const activeAssignmentsCount = counter.for('activeAssignmentsCount');
export const assignmentsCount = counter.for('assignmentsCount');
export const endedAssignmentsCount = counter.for('endedAssignmentsCount');
export const completedAssignmentsCount = counter.for(
  'completedAssignmentsCount',
);
const rejectedNurseCount = counter.for('rejectedNurseCount');
const rejectedHospiceCount = counter.for('rejectedHospiceCount');
const unSubmittedRouteSheetsCount = counter.for('unSubmittedRouteSheetsCount');
const unApprovedSubmittedRouteSheetsCount = counter.for(
  'unApprovedSubmittedRouteSheetsCount',
);
const pendingHospiceAccountsUpdate = counter.for('pendingHospiceAccounts');
const pendingNurseAccountsUpdate = counter.for('pendingNurseAccounts');

export const updateCount = async (ctx: MutationCtx) => {
  // await approvedNurseCount.add(ctx, 1);
  // await suspendedNursesCount.subtract(ctx, 1);
  // await approvedHospiceCount.add(ctx, 1);
  // await suspendedHospicesCount.subtract(ctx, 1);
  await completedAssignmentsCount.subtract(ctx, 1);
};

export const handlePendingHospiceAccountsUpdate = async (
  ctx: MutationCtx,
  action: 'inc' | 'dec',
) => {
  if (action === 'inc') {
    await pendingHospiceAccountsUpdate.inc(ctx);
  } else {
    const count = await pendingHospiceAccountsUpdate.count(ctx);
    if (count > 0) {
      await pendingHospiceAccountsUpdate.dec(ctx);
    }
  }
};
export const getPendingHospiceAccountsUpdate = async (ctx: QueryCtx) => {
  return await pendingHospiceAccountsUpdate.count(ctx);
};
export const handlePendingNurseAccountsUpdate = async (
  ctx: MutationCtx,
  action: 'inc' | 'dec',
) => {
  if (action === 'inc') {
    await pendingNurseAccountsUpdate.inc(ctx);
  } else {
    const count = await pendingNurseAccountsUpdate.count(ctx);
    if (count > 0) {
      await pendingNurseAccountsUpdate.dec(ctx);
    }
  }
};
export const getPendingNurseAccountsUpdate = async (ctx: QueryCtx) => {
  return await pendingNurseAccountsUpdate.count(ctx);
};

export const handleUnApprovedSubmittedRouteSheets = async (
  ctx: MutationCtx,
  action: 'inc' | 'dec',
) => {
  if (action === 'inc') {
    await unApprovedSubmittedRouteSheetsCount.inc(ctx);
  } else {
    const count = await unApprovedSubmittedRouteSheetsCount.count(ctx);
    if (count > 0) {
      await unApprovedSubmittedRouteSheetsCount.dec(ctx);
    }
  }
};

export const getUnApprovedSubmittedRouteSheetCount = async (ctx: QueryCtx) => {
  return await unApprovedSubmittedRouteSheetsCount.count(ctx);
};
export const handleUnSubmittedRouteSheetsCount = async (
  ctx: MutationCtx,
  action: 'inc' | 'dec',
) => {
  if (action === 'inc') {
    await unSubmittedRouteSheetsCount.inc(ctx);
  } else {
    const count = await unSubmittedRouteSheetsCount.count(ctx);
    if (count > 0) {
      await unSubmittedRouteSheetsCount.dec(ctx);
    }
  }
};

export const getUnSubmittedRouteSheetCount = async (ctx: QueryCtx) => {
  return await unSubmittedRouteSheetsCount.count(ctx);
};
export const handleRejectedNurseCount = async (
  ctx: MutationCtx,
  action: 'inc' | 'dec',
) => {
  if (action === 'inc') {
    await rejectedNurseCount.inc(ctx);
  } else {
    const count = await rejectedNurseCount.count(ctx);
    if (count > 0) {
      await rejectedNurseCount.dec(ctx);
    }
  }
};

export const getRejectedNurseCount = async (ctx: QueryCtx) => {
  return await rejectedNurseCount.count(ctx);
};

export const handleRejectedHospiceCount = async (
  ctx: MutationCtx,
  action: 'inc' | 'dec',
) => {
  if (action === 'inc') {
    await rejectedHospiceCount.inc(ctx);
  } else {
    const count = await rejectedHospiceCount.count(ctx);
    if (count > 0) {
      await rejectedHospiceCount.dec(ctx);
    }
  }
};

export const getRejectedHospiceCount = async (ctx: QueryCtx) => {
  return await rejectedHospiceCount.count(ctx);
};

export const handlePendingHospiceApprovalCount = async (
  ctx: MutationCtx,
  action: 'inc' | 'dec',
) => {
  if (action === 'inc') {
    await pendingHospiceApprovalCount.inc(ctx);
  } else {
    const count = await pendingHospiceApprovalCount.count(ctx);
    if (count > 0) {
      await pendingHospiceApprovalCount.dec(ctx);
    }
  }
};
export const getPendingHospiceApprovalCount = async (ctx: QueryCtx) => {
  return await pendingHospiceApprovalCount.count(ctx);
};

export const handleEndedAssignmentCount = async (
  ctx: MutationCtx,
  action: 'inc' | 'dec',
) => {
  if (action === 'inc') {
    await endedAssignmentsCount.inc(ctx);
  } else {
    const count = await endedAssignmentsCount.count(ctx);
    if (count > 0) {
      await endedAssignmentsCount.dec(ctx);
    }
  }
};

export const getEndedAssignmentsCount = async (ctx: QueryCtx) => {
  return await endedAssignmentsCount.count(ctx);
};
export const handleCompletedAssignmentCount = async (
  ctx: MutationCtx,
  action: 'inc' | 'dec',
) => {
  if (action === 'inc') {
    await completedAssignmentsCount.inc(ctx);
  } else {
    const count = await completedAssignmentsCount.count(ctx);
    if (count > 0) {
      await completedAssignmentsCount.dec(ctx);
    }
  }
};
export const getCompletedAssignmentsCount = async (ctx: QueryCtx) => {
  return await completedAssignmentsCount.count(ctx);
};

export const handleNurseCount = async (
  ctx: MutationCtx,
  action: 'inc' | 'dec',
) => {
  if (action === 'inc') {
    await nurseCount.inc(ctx);
  } else {
    const count = await nurseCount.count(ctx);
    if (count > 0) {
      await nurseCount.dec(ctx);
    }
  }
};
export const getNurseCount = async (ctx: QueryCtx) => {
  return await nurseCount.count(ctx);
};

export const handleApproveNurseCount = async (
  ctx: MutationCtx,
  action: 'inc' | 'dec',
) => {
  if (action === 'inc') {
    await approvedNurseCount.inc(ctx);
  } else {
    const count = await approvedNurseCount.count(ctx);
    if (count > 0) {
      await approvedNurseCount.dec(ctx);
    }
  }
};

export const getApproveNurseCount = async (ctx: QueryCtx) => {
  return await approvedNurseCount.count(ctx);
};
export const handleApproveHospiceCount = async (
  ctx: MutationCtx,
  action: 'inc' | 'dec',
) => {
  if (action === 'inc') {
    await approvedHospiceCount.inc(ctx);
  } else {
    const count = await approvedHospiceCount.count(ctx);
    if (count > 0) {
      await approvedHospiceCount.dec(ctx);
    }
  }
};
export const getApproveHospiceCount = async (ctx: QueryCtx) => {
  return await approvedHospiceCount.count(ctx);
};
export const handleHospiceCount = async (
  ctx: MutationCtx,
  action: 'inc' | 'dec',
) => {
  if (action === 'inc') {
    await hospiceCount.inc(ctx);
  } else {
    const count = await hospiceCount.count(ctx);
    if (count > 0) {
      await hospiceCount.dec(ctx);
    }
  }
};
export const getHospiceCount = async (ctx: QueryCtx) => {
  return await hospiceCount.count(ctx);
};

export const handleSuspendedNurseCount = async (
  ctx: MutationCtx,
  action: 'inc' | 'dec',
) => {
  if (action === 'inc') {
    await suspendedNursesCount.inc(ctx);
  } else {
    const count = await suspendedNursesCount.count(ctx);
    if (count > 0) {
      await suspendedNursesCount.dec(ctx);
    }
  }
};
export const getSuspendedNursesCount = async (ctx: QueryCtx) => {
  return await suspendedNursesCount.count(ctx);
};

export const handleSuspendedHospiceCount = async (
  ctx: MutationCtx,
  action: 'inc' | 'dec',
) => {
  if (action === 'inc') {
    await suspendedHospicesCount.inc(ctx);
  } else {
    const count = await suspendedHospicesCount.count(ctx);
    if (count > 0) {
      await suspendedHospicesCount.dec(ctx);
    }
  }
};
export const getSuspendedHospicesCount = async (ctx: QueryCtx) => {
  return await suspendedHospicesCount.count(ctx);
};

export const handlePendingNurseApprovalCount = async (
  ctx: MutationCtx,
  action: 'inc' | 'dec',
) => {
  if (action === 'inc') {
    await pendingNurseApprovalCount.inc(ctx);
  } else {
    const count = await pendingNurseApprovalCount.count(ctx);
    if (count > 0) {
      await pendingNurseApprovalCount.dec(ctx);
    }
  }
};

export const getPendingNurseApprovalCount = async (ctx: QueryCtx) => {
  return await pendingNurseApprovalCount.count(ctx);
};

export const handleActiveAssignmentsCount = async (
  ctx: MutationCtx,
  action: 'inc' | 'dec',
) => {
  if (action === 'inc') {
    await activeAssignmentsCount.inc(ctx);
  } else {
    const count = await activeAssignmentsCount.count(ctx);
    if (count > 0) {
      await activeAssignmentsCount.dec(ctx);
    }
  }
};
export const getActiveAssignmentsCount = async (ctx: QueryCtx) => {
  return await activeAssignmentsCount.count(ctx);
};

export const handleAssignmentsCount = async (
  ctx: MutationCtx,
  action: 'inc' | 'dec',
) => {
  if (action === 'inc') {
    await assignmentsCount.inc(ctx);
  } else {
    const count = await assignmentsCount.count(ctx);
    if (count > 0) {
      await assignmentsCount.dec(ctx);
    }
  }
};
export const getAssignmentsCount = async (ctx: QueryCtx) => {
  return await assignmentsCount.count(ctx);
};
