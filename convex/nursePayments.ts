import { ConvexError, v } from 'convex/values';
import { internalMutation, query } from './_generated/server';
import { getUserHelperFn } from './helper';

// ── Internal Mutations ────────────────────────────────────────────────────────

export const savePaymentMethod = internalMutation({
  args: {
    nurseId: v.id('nurses'),
    stripeCustomerId: v.string(),
    stripePaymentMethodId: v.string(),
    last4: v.string(),
    brand: v.string(),
    expMonth: v.number(),
    expYear: v.number(),
    isDefault: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('nursePaymentMethods', {
      nurseId: args.nurseId,
      stripeCustomerId: args.stripeCustomerId,
      stripePaymentMethodId: args.stripePaymentMethodId,
      last4: args.last4,
      brand: args.brand,
      expMonth: args.expMonth,
      expYear: args.expYear,
      isDefault: args.isDefault,
    });
  },
});

export const updateNurseStripeCustomer = internalMutation({
  args: {
    nurseId: v.id('nurses'),
    stripeCustomerId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.nurseId, {
      stripeCustomerId: args.stripeCustomerId,
    });
  },
});

export const deletePaymentMethod = internalMutation({
  args: {
    paymentMethodId: v.id('nursePaymentMethods'),
  },
  handler: async (ctx, args) => {
    const paymentMethod = await ctx.db.get(args.paymentMethodId);
    if (!paymentMethod) {
      throw new ConvexError({ message: 'Payment method not found' });
    }

    await ctx.db.delete(args.paymentMethodId);

    // Auto-promote next card to default if the deleted one was default
    if (paymentMethod.isDefault) {
      const remaining = await ctx.db
        .query('nursePaymentMethods')
        .withIndex('by_nurse', (q) => q.eq('nurseId', paymentMethod.nurseId))
        .collect();

      if (remaining.length > 0) {
        await ctx.db.patch(remaining[0]._id, { isDefault: true });
      }
    }
  },
});

export const updatePaymentMethodDefault = internalMutation({
  args: {
    paymentMethodId: v.id('nursePaymentMethods'),
    nurseId: v.id('nurses'),
  },
  handler: async (ctx, args) => {
    const allMethods = await ctx.db
      .query('nursePaymentMethods')
      .withIndex('by_nurse', (q) => q.eq('nurseId', args.nurseId))
      .collect();

    for (const method of allMethods) {
      await ctx.db.patch(method._id, {
        isDefault: method._id === args.paymentMethodId,
      });
    }
  },
});

// ── Queries ───────────────────────────────────────────────────────────────────

export const getPaymentMethods = query({
  args: { nurseId: v.id('nurses') },
  handler: async (ctx, args) => {
    const user = await getUserHelperFn(ctx);
    if (!user) {
      throw new ConvexError({ message: 'User not authenticated' });
    }

    return ctx.db
      .query('nursePaymentMethods')
      .withIndex('by_nurse', (q) => q.eq('nurseId', args.nurseId))
      .collect();
  },
});

export const getPaymentMethodById = query({
  args: { paymentMethodId: v.id('nursePaymentMethods') },
  handler: async (ctx, args) => {
    const user = await getUserHelperFn(ctx);
    if (!user) {
      throw new ConvexError({ message: 'User not authenticated' });
    }
    return ctx.db.get(args.paymentMethodId);
  },
});

export const getDefaultPaymentMethod = query({
  args: { nurseId: v.id('nurses') },
  handler: async (ctx, args) => {
    const user = await getUserHelperFn(ctx);
    if (!user) return null;

    return ctx.db
      .query('nursePaymentMethods')
      .withIndex('by_nurse', (q) => q.eq('nurseId', args.nurseId))
      .filter((q) => q.eq(q.field('isDefault'), true))
      .first();
  },
});
