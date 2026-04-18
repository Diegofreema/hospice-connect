'use node';

/**
 * Node.js action for approving/declining route sheets.
 * Runs synchronously: charges the nurse's Stripe card before marking approved.
 * If the card is declined, throws so the hospice cannot complete approval.
 */

import { ConvexError, v } from 'convex/values';
import { internal } from './_generated/api';
import { Id } from './_generated/dataModel';
import { action } from './_generated/server';
import {
  chargeOffSession,
  getStripeCustomer,
  getStripeErrorMessage,
  listCustomerPaymentMethods,
} from './stripeHelper';

export const approveOrDeclineRouteSheet = action({
  args: {
    routeSheetId: v.id('routeSheets'),
    isApproved: v.boolean(),
    hospiceId: v.id('hospices'),
    reason: v.optional(v.string()),
    notificationId: v.id('hospiceNotifications'),
    totalEarnings: v.number(),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{
    nurseId: Id<'nurses'>;
    hospiceBusinessName: string;
    patientFirstName: string;
    patientLastName: string;
  }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({ message: 'Unauthorized' });
    }

    // ── Fetch all needed records ───────────────────────────────────────────
    const [hospice, routeSheet, notification] = await Promise.all([
      ctx.runQuery(internal.routeSheetsHelpers.getHospiceInternal, {
        hospiceId: args.hospiceId,
      }),
      ctx.runQuery(internal.routeSheetsHelpers.getRouteSheetInternal, {
        routeSheetId: args.routeSheetId,
      }),
      ctx.runQuery(internal.routeSheetsHelpers.getNotificationInternal, {
        notificationId: args.notificationId,
      }),
    ]);

    if (!hospice) throw new ConvexError({ message: 'Hospice not found' });
    if (!routeSheet)
      throw new ConvexError({ message: 'Route sheet not found' });
    if (!notification)
      throw new ConvexError({ message: 'Notification not found' });
    if (routeSheet.hospiceId !== args.hospiceId)
      throw new ConvexError({ message: 'Unauthorized' });

    const nurse = await ctx.runQuery(
      internal.routeSheetsHelpers.getNurseInternal,
      {
        nurseId: routeSheet.nurseId,
      },
    );
    if (!nurse) throw new ConvexError({ message: 'Nurse not found' });

    const assignment = await ctx.runQuery(
      internal.routeSheetsHelpers.getAssignmentInternal,
      {
        assignmentId: routeSheet.assignmentId,
      },
    );
    if (!assignment) throw new ConvexError({ message: 'Assignment not found' });

    const nurseAssignment = await ctx.runQuery(
      internal.routeSheetsHelpers.getNurseAssignmentInternal,
      { assignmentId: assignment._id, nurseId: nurse._id },
    );
    if (!nurseAssignment)
      throw new ConvexError({ message: 'Nurse assignment not found' });

    // ── Decline path ───────────────────────────────────────────────────────
    if (!args.isApproved) {
      await ctx.runMutation(
        internal.routeSheetsHelpers.declineRouteSheetMutation,
        {
          routeSheetId: args.routeSheetId,
          nurseId: nurse._id,
          hospiceId: args.hospiceId,
          assignmentId: assignment._id,
          notificationId: args.notificationId,
          nurseAssignmentId: nurseAssignment._id,
          scheduleIds: routeSheet.scheduleIds,
          hospiceBusinessName: hospice.businessName,
          patientFirstName: assignment.patientFirstName,
          patientLastName: assignment.patientLastName,
          reason: args.reason,
        },
      );

      return {
        nurseId: nurse._id,
        hospiceBusinessName: hospice.businessName,

        patientFirstName: assignment.patientFirstName,
        patientLastName: assignment.patientLastName,
      };
    }

    // ── Approve path: charge Stripe first ─────────────────────────────────
    // 1. Look up nurse's Stripe customer and default payment method
    if (!nurse.stripeCustomerId) {
      throw new ConvexError({
        message:
          'This nurse has no payment method added. Please ask them to add a card before approving.',
      });
    }

    const customer = await getStripeCustomer(nurse.stripeCustomerId);
    const defaultPmId =
      typeof customer.invoice_settings?.default_payment_method === 'string'
        ? customer.invoice_settings.default_payment_method
        : ((customer.invoice_settings?.default_payment_method as any)?.id ??
          null);

    const cards = await listCustomerPaymentMethods(
      nurse.stripeCustomerId,
      defaultPmId,
    );
    const defaultCard = cards.find((c) => c.isDefault) ?? cards[0];

    if (!defaultCard) {
      throw new ConvexError({
        message:
          'This nurse has no payment method added. Please ask them to add a card before approving.',
      });
    }

    // 2. Calculate commission
    const commission = await ctx.runQuery(
      internal.adminSettings.getCommissionInternal,
      {},
    );

    if (commission && commission > 0) {
      const totalEarnings = args.totalEarnings;

      if (totalEarnings > 0) {
        const commissionAmountCents = Math.round(
          totalEarnings * (commission / 100) * 100,
        );

        const description = `Commission (${commission}%) — approved by ${hospice.businessName}`;

        try {
          await chargeOffSession(
            nurse.stripeCustomerId,
            defaultCard.id,
            commissionAmountCents,
            'usd',
            description,
          );

          await ctx.runMutation(
            internal.routeSheets.updateHospiceNotificationStatus,
            {
              notificationId: args.notificationId,
              status: 'accepted',
            },
          );
        } catch (err: any) {
          const cleanMessage = getStripeErrorMessage(err);

          // Card was declined or charge failed — notify nurse and block approval
          await ctx.runMutation(
            internal.routeSheetsHelpers.insertCardDeclinedNotification,
            {
              nurseId: nurse._id,
              hospiceId: args.hospiceId,
              errorMessage: cleanMessage,
            },
          );

          throw new ConvexError({
            message: `Payment failed: ${cleanMessage}. The nurse has been notified to update their payment method.`,
          });
        }
      }
    }

    // 3. Everything succeeded — mark route sheet as approved
    await ctx.runMutation(
      internal.routeSheetsHelpers.approveRouteSheetMutation,
      {
        routeSheetId: args.routeSheetId,
        nurseId: nurse._id,
        hospiceId: args.hospiceId,
        assignmentId: assignment._id,
        notificationId: args.notificationId,
        nurseAssignmentId: nurseAssignment._id,
        hospiceBusinessName: hospice.businessName,
        patientFirstName: assignment.patientFirstName,
        patientLastName: assignment.patientLastName,
        nurseStatus: nurse.status,
      },
    );
    return {
      nurseId: nurse._id,
      hospiceBusinessName: hospice.businessName,
      patientFirstName: assignment.patientFirstName,
      patientLastName: assignment.patientLastName,
    };
  },
});
