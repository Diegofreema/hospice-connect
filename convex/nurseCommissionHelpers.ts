/**
 * Internal query and mutation helpers for the nurse commission flow.
 * This is a regular (V8) Convex file so it can export internalQuery / internalMutation.
 * The 'use node' action that calls these lives in nurseCommission.ts.
 */

import { v } from 'convex/values';
import { internalMutation, internalQuery } from './_generated/server';

// ── Query helpers ─────────────────────────────────────────────────────────────

/** Returns rates of given schedule IDs — used to calculate total shift earnings */
export const getScheduleRates = internalQuery({
  args: { scheduleIds: v.array(v.id('schedules')) },
  handler: async (ctx, args): Promise<number[]> => {
    const rates: number[] = [];
    for (const id of args.scheduleIds) {
      const s = await ctx.db.get(id);
      if (s) rates.push(s.rate);
    }
    return rates;
  },
});

/** Returns the nurse's default payment method — usable from internalAction */
export const getDefaultPaymentMethodInternal = internalQuery({
  args: { nurseId: v.id('nurses') },
  handler: async (ctx, args) => {
    return ctx.db
      .query('nursePaymentMethods')
      .withIndex('by_nurse', (q) => q.eq('nurseId', args.nurseId))
      .filter((q) => q.eq(q.field('isDefault'), true))
      .first();
  },
});

// ── Notification helpers ──────────────────────────────────────────────────────

export const insertNoCardNotification = internalMutation({
  args: { nurseId: v.id('nurses') },
  handler: async (ctx, args) => {
    await ctx.db.insert('nurseNotifications', {
      nurseId: args.nurseId,
      isRead: false,
      title: 'Payment method required',
      description:
        'Your route sheet was approved! Please add a payment card in the Billing section so your commission can be processed.',
      type: 'normal',
      viewCount: 0,
    });
  },
});

export const insertChargeFailedNotification = internalMutation({
  args: { nurseId: v.id('nurses'), errorMessage: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.insert('nurseNotifications', {
      nurseId: args.nurseId,
      isRead: false,
      title: 'Commission charge failed',
      description: `We could not charge your commission. Please ensure your card is valid. (${args.errorMessage})`,
      type: 'normal',
      viewCount: 0,
    });
  },
});
