/**
 * Internal mutation helpers for the route sheet approve/decline action.
 * Extracted here so the 'use node' action in routeSheets.ts can call them.
 */

import { ConvexError, v } from 'convex/values';
import { internalMutation, internalQuery } from './_generated/server';
import {
  handleApproveNurseCount,
  handleSuspendedNurseCount,
  handleUnApprovedSubmittedRouteSheets,
  handleUnSubmittedRouteSheetsCount,
} from './counter';
import {
  checkDurationOfNotSubmittedAssignment,
  sendPushNotificationHelper,
} from './helper';

// ── Internal Queries (for use from the node action) ─────────────────────────

export const getRouteSheetInternal = internalQuery({
  args: { routeSheetId: v.id('routeSheets') },
  handler: async (ctx, args) => ctx.db.get(args.routeSheetId),
});

export const getNurseInternal = internalQuery({
  args: { nurseId: v.id('nurses') },
  handler: async (ctx, args) => ctx.db.get(args.nurseId),
});

export const getHospiceInternal = internalQuery({
  args: { hospiceId: v.id('hospices') },
  handler: async (ctx, args) => ctx.db.get(args.hospiceId),
});

export const getAssignmentInternal = internalQuery({
  args: { assignmentId: v.id('assignments') },
  handler: async (ctx, args) => ctx.db.get(args.assignmentId),
});

export const getNotificationInternal = internalQuery({
  args: { notificationId: v.id('hospiceNotifications') },
  handler: async (ctx, args) => ctx.db.get(args.notificationId),
});

export const getNurseAssignmentInternal = internalQuery({
  args: {
    assignmentId: v.id('assignments'),
    nurseId: v.id('nurses'),
  },
  handler: async (ctx, args) =>
    ctx.db
      .query('nurseAssignments')
      .withIndex('assignmentId', (q) =>
        q.eq('assignmentId', args.assignmentId).eq('nurseId', args.nurseId),
      )
      .first(),
});

export const approveRouteSheetMutation = internalMutation({
  args: {
    routeSheetId: v.id('routeSheets'),
    nurseId: v.id('nurses'),
    hospiceId: v.id('hospices'),
    assignmentId: v.id('assignments'),
    notificationId: v.id('hospiceNotifications'),
    nurseAssignmentId: v.id('nurseAssignments'),
    hospiceBusinessName: v.string(),
    patientFirstName: v.string(),
    patientLastName: v.string(),
    nurseStatus: v.string(),
  },
  handler: async (ctx, args) => {
    const nurse = await ctx.db.get('nurses', args.nurseId);
    if (!nurse) throw new ConvexError({ message: 'Nurse not found' });
    // Mark route sheet as approved
    await ctx.db.patch(args.routeSheetId, {
      isSeen: true,
      status: 'approved',
    });

    // ── Auto-reactivation check ────────────────────────────────────────────
    if (args.nurseStatus === 'suspended') {
      const allAssignments = await ctx.db
        .query('nurseAssignments')
        .withIndex('nurse_id_is_submitted', (q) =>
          q
            .eq('nurseId', args.nurseId)
            .eq('isCompleted', true)
            .eq('isSubmitted', false),
        )
        .collect();

      const stillOverdue = allAssignments.some(
        (a) =>
          a._id !== args.nurseAssignmentId &&
          checkDurationOfNotSubmittedAssignment(7, a),
      );

      if (!stillOverdue) {
        const body = `${args.hospiceBusinessName} accepted your route sheet for ${args.patientFirstName} ${args.patientLastName}.Your account is now active.`;
        await ctx.db.patch(args.nurseId, { status: 'approved' });
        await handleApproveNurseCount(ctx, 'inc');
        await handleSuspendedNurseCount(ctx, 'dec');

        await ctx.db.insert('nurseNotifications', {
          nurseId: args.nurseId,
          isRead: false,
          title: 'Route sheet approved',
          description: body,
          type: 'admin',
          viewCount: 0,
        });
      }
    } else {
      await ctx.db.patch('hospiceNotifications', args.notificationId, {
        status: 'accepted',
      });
      const body = `${args.hospiceBusinessName} accepted your route sheet for ${args.patientFirstName} ${args.patientLastName}.`;
      await ctx.db.insert('nurseNotifications', {
        isRead: false,
        nurseId: args.nurseId,
        title: 'Route sheet approved',
        description: body,
        type: 'normal',
        hospiceId: args.hospiceId,
        viewCount: 0,
      });
    }

    await handleUnApprovedSubmittedRouteSheets(ctx, 'dec');
  },
});

export const declineRouteSheetMutation = internalMutation({
  args: {
    routeSheetId: v.id('routeSheets'),
    nurseId: v.id('nurses'),
    hospiceId: v.id('hospices'),
    assignmentId: v.id('assignments'),
    notificationId: v.id('hospiceNotifications'),
    nurseAssignmentId: v.id('nurseAssignments'),
    scheduleIds: v.array(v.id('schedules')),
    hospiceBusinessName: v.string(),
    patientFirstName: v.string(),
    patientLastName: v.string(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const text = `Reason: ${args.reason || 'N/A'}, Please resubmit shortly.`;

    await ctx.db.patch('routeSheets', args.routeSheetId, {
      isSeen: true,
      status: 'declined',
    });

    for (const scheduleId of args.scheduleIds) {
      await ctx.db.patch(scheduleId, { isSubmitted: false });
    }

    await ctx.db.patch('hospiceNotifications', args.notificationId, {
      status: 'declined',
    });
    await ctx.db.patch('nurseAssignments', args.nurseAssignmentId, {
      isSubmitted: false,
    });

    const body = `${args.hospiceBusinessName} declined your route sheet for ${args.patientFirstName} ${args.patientLastName}. ${text}`;

    await ctx.db.insert('nurseNotifications', {
      isRead: false,
      nurseId: args.nurseId,
      title: 'Route sheet declined',
      description: body,
      type: 'normal',
      hospiceId: args.hospiceId,
      viewCount: 0,
    });

    await handleUnApprovedSubmittedRouteSheets(ctx, 'dec');
    await handleUnSubmittedRouteSheetsCount(ctx, 'inc');
  },
});

/** Sends an admin notification telling the nurse and hospice about the payment failure. */
export const insertCardDeclinedNotification = internalMutation({
  args: {
    nurseId: v.id('nurses'),
    hospiceId: v.id('hospices'),
    errorMessage: v.string(),
  },
  handler: async (ctx, args) => {
    const [nurse, hospice] = await Promise.all([
      ctx.db.get('nurses', args.nurseId),
      ctx.db.get('hospices', args.hospiceId),
    ]);
    if (!nurse || !hospice) {
      return;
    }
    const body = `Your card was declined when processing your commission: ${args.errorMessage}. Please update your payment method in Billing & Payments to continue accepting shifts.`;
    await ctx.db.insert('nurseNotifications', {
      nurseId: args.nurseId,
      isRead: false,
      title: 'Card Declined — Action Required',
      description: body,
      type: 'admin',
      viewCount: 0,
    });

    await sendPushNotificationHelper({
      ctx,
      userId: nurse.userId,
      title: 'Card Declined — Action Required',
      body: body,
      data: {
        type: 'normal',
      },
    });
    const _body = `The nurse's payment method was declined: ${args.errorMessage}. The nurse has been notified to update their payment method.`;

    await ctx.db.insert('hospiceNotifications', {
      hospiceId: args.hospiceId,
      isRead: false,
      title: 'Commission Payment Failed',
      description: _body,
      type: 'admin',
      viewCount: 0,
    });
    await sendPushNotificationHelper({
      ctx,
      userId: hospice.userId,
      title: 'Commission Payment Failed',
      body: _body,
      data: {
        type: 'normal',
      },
    });
  },
});
