/**
 * Internal query and mutation helpers for the nurse commission flow.
 * This is a regular (V8) Convex file so it can export internalQuery / internalMutation.
 * The 'use node' action that calls these lives in nurseCommission.ts.
 */

import { v } from 'convex/values';
import { internalMutation, internalQuery } from './_generated/server';
import { parse } from 'date-fns';
import { type Doc } from './_generated/dataModel';

// ── Date parsing utilities matching frontend calculateTotalHours ──────────────

export function convertTimeStringToDate2(timeString: string, value?: string) {
  if (!timeString) return { hours: 0, minutes: 0 };
  const [time, period] = timeString.split(/\s+/);
  const [hours, minutes] = time.split(':').map(Number);
  let hours24 = hours;
  if (period?.toUpperCase() === 'PM' && hours !== 12) {
    hours24 += 12;
  } else if (period?.toUpperCase() === 'AM' && hours === 12) {
    hours24 = 0;
  }
  return { hours: hours24, minutes: minutes };
}

export function calculateTotalHours(shifts: Doc<'schedules'>[]) {
  let totalHours = 0;
  for (const shift of shifts) {
    const startDateObj = parse(shift.startDate, 'dd-MM-yyyy', new Date());
    const startParts = convertTimeStringToDate2(shift.startTime);
    startDateObj.setHours(startParts.hours, startParts.minutes, 0, 0);

    // ── Time was edited → always use startTime to endTime ─────────────────
    if (shift.isTimeEdited || shift.isEdited) {
      if (shift.canceledAt) {
        const canceledDate = new Date(shift.canceledAt);
        if (canceledDate.getTime() <= startDateObj.getTime()) continue;
      }
      const endDateObj = parse(shift.endDate, 'dd-MM-yyyy', new Date());
      const endParts = convertTimeStringToDate2(shift.endTime);
      endDateObj.setHours(endParts.hours, endParts.minutes, 0, 0);
      let hours = (endDateObj.getTime() - startDateObj.getTime()) / 3600000;
      if (hours < 0) hours += 24;
      totalHours += hours;
      continue;
    }

    // ── Cancelled (not edited) ───────────────────────────────────────────────
    if (shift.canceledAt) {
      const canceledDate = new Date(shift.canceledAt);
      if (shift.reassignedAt) {
        const reassignedDate = new Date(shift.reassignedAt);
        if (canceledDate.getTime() <= reassignedDate.getTime()) continue;
      }
      if (canceledDate.getTime() <= startDateObj.getTime()) continue;
      const diff = (canceledDate.getTime() - startDateObj.getTime()) / 3600000;
      totalHours += diff;
      continue;
    }

    // ── Reassigned (not edited) ──────────────────────────────────────────────
    if (shift.reassignedAt) {
      const reassignedDate = new Date(shift.reassignedAt);
      const endDateObj = parse(shift.endDate, 'dd-MM-yyyy', new Date());
      const endParts = convertTimeStringToDate2(shift.endTime);
      endDateObj.setHours(endParts.hours, endParts.minutes, 0, 0);
      if (reassignedDate.getTime() >= endDateObj.getTime()) continue;
      let diff = (endDateObj.getTime() - reassignedDate.getTime()) / 3600000;
      if (diff < 0) diff += 24;
      totalHours += diff;
      continue;
    }

    // ── Default (normal shift) ────────────────────────────────────────────────
    const endDateObj = parse(shift.endDate, 'dd-MM-yyyy', new Date());
    const endParts = convertTimeStringToDate2(shift.endTime);
    endDateObj.setHours(endParts.hours, endParts.minutes, 0, 0);
    let hours = (endDateObj.getTime() - startDateObj.getTime()) / 3600000;
    if (hours < 0) hours += 24;
    totalHours += hours;
  }
  return totalHours;
}

// ── Query helpers ─────────────────────────────────────────────────────────────

/** Returns total earnings of given schedule IDs — used to calculate total shift earnings */
export const getScheduleRates = internalQuery({
  args: { scheduleIds: v.array(v.id('schedules')) },
  handler: async (ctx, args): Promise<number[]> => {
    const earnings: number[] = [];
    for (const id of args.scheduleIds) {
      const s = await ctx.db.get('schedules', id);
      if (s) {
        const hours = calculateTotalHours([s]);
        // earnings = hourly rate * worked hours
        earnings.push(s.rate * hours);
      }
    }
    return earnings;
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
      type: 'admin',
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

export const insertChargeSuccessNotification = internalMutation({
  args: {
    nurseId: v.id('nurses'),
    amountCents: v.number(),
    hospiceBusinessName: v.string(),
  },
  handler: async (ctx, args) => {
    const amountStr = (args.amountCents / 100).toFixed(2);
    await ctx.db.insert('nurseNotifications', {
      nurseId: args.nurseId,
      isRead: false,
      title: 'Commission Processed',
      description: `You have been successfully charged $${amountStr} for the ${args.hospiceBusinessName} route sheet commission.`,
      type: 'admin',
      viewCount: 0,
    });
  },
});
