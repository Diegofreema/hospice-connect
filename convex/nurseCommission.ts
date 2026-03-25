'use node';
/**
 * Node.js action for nurse commission billing.
 * V8 helper queries/mutations are in nurseCommissionHelpers.ts.
 */

import { v } from 'convex/values';
import { internal } from './_generated/api';
import { internalAction } from './_generated/server';
import { chargeOffSession } from './stripeHelper';

export const chargeNurseCommission = internalAction({
  args: {
    nurseId: v.id('nurses'),
    scheduleIds: v.array(v.id('schedules')),
    hospiceBusinessName: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Get admin commission percentage (internal query in adminSettings.ts)
    const commission = await ctx.runQuery(
      internal.adminSettings.getCommissionInternal,
      {},
    );
    if (!commission || commission <= 0) return;

    // 2. Get nurse's default payment method
    const defaultPm = await ctx.runQuery(
      internal.nurseCommissionHelpers.getDefaultPaymentMethodInternal,
      { nurseId: args.nurseId },
    );

    if (!defaultPm) {
      await ctx.runMutation(
        internal.nurseCommissionHelpers.insertNoCardNotification,
        { nurseId: args.nurseId },
      );
      return;
    }

    // 3. Sum schedule rates
    const scheduleRates = await ctx.runQuery(
      internal.nurseCommissionHelpers.getScheduleRates,
      { scheduleIds: args.scheduleIds },
    );
    const totalRate = (scheduleRates as number[]).reduce(
      (sum: number, r: number) => sum + r,
      0,
    );
    if (totalRate <= 0) return;

    // 4. Charge commission (convert dollars to cents)
    const commissionAmountCents = Math.round(
      totalRate * (commission / 100) * 100,
    );
    const description = `Commission (${commission}%) — approved by ${args.hospiceBusinessName}`;

    try {
      await chargeOffSession(
        defaultPm.stripeCustomerId,
        defaultPm.stripePaymentMethodId,
        commissionAmountCents,
        'usd',
        description,
      );

      await ctx.runMutation(
        internal.nurseCommissionHelpers.insertChargeSuccessNotification,
        {
          nurseId: args.nurseId,
          amountCents: commissionAmountCents,
          hospiceBusinessName: args.hospiceBusinessName,
        },
      );
    } catch (err: any) {
      console.error('[chargeNurseCommission] charge failed:', err?.message);
      await ctx.runMutation(
        internal.nurseCommissionHelpers.insertChargeFailedNotification,
        {
          nurseId: args.nurseId,
          errorMessage: err?.message ?? 'Unknown error',
        },
      );
    }
  },
});
