'use node';

import { ConvexError, v } from 'convex/values';
import { api, internal } from './_generated/api';
import { action } from './_generated/server';
import {
  attachPaymentMethodToCustomer,
  createSetupIntent,
  createStripeCustomer,
  detachPaymentMethod,
  getPaymentMethod,
} from './stripeHelper';

// ── Actions ───────────────────────────────────────────────────────────────────

/**
 * Step 1 of add-card flow:
 * Get or create a Stripe Customer, then create a SetupIntent.
 * Returns client_secret for the native Stripe SDK to confirm on the client.
 */
export const createSetupIntentForNurse = action({
  args: {
    nurseId: v.id('nurses'),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{ clientSecret: string; customerId: string }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({ message: 'User not authenticated' });
    }

    // Fetch nurse via query (actions can run queries)
    const nurse = await ctx.runQuery(api.nurses.getNurseById, {
      userId: identity.subject,
    });
    if (!nurse) {
      throw new ConvexError({ message: 'Nurse not found' });
    }

    let stripeCustomerId: string = nurse.stripeCustomerId ?? '';

    if (!stripeCustomerId) {
      const customer = await createStripeCustomer(
        nurse.name,
        nurse.email,
        args.nurseId,
      );
      stripeCustomerId = customer.id;
      await ctx.runMutation(internal.nursePayments.updateNurseStripeCustomer, {
        nurseId: args.nurseId,
        stripeCustomerId,
      });
    }

    const setupIntent = await createSetupIntent(stripeCustomerId);

    return {
      clientSecret: setupIntent.client_secret,
      customerId: stripeCustomerId,
    };
  },
});

/**
 * Step 2 of add-card flow (called after client confirms the SetupIntent):
 * The Stripe SDK gives us the paymentMethodId from the confirmed SetupIntent.
 * We attach it to the customer and save it to our DB.
 */
export const addPaymentMethod = action({
  args: {
    nurseId: v.id('nurses'),
    paymentMethodId: v.string(), // Stripe PM id from confirmed SetupIntent
    stripeCustomerId: v.string(),
  },
  handler: async (ctx, args): Promise<{ success: boolean }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({ message: 'User not authenticated' });
    }

    // Attach PM to customer (idempotent if already attached after SI confirm)
    await attachPaymentMethodToCustomer(
      args.paymentMethodId,
      args.stripeCustomerId,
    ).catch(() => {
      // Silently ignore; PM may already be attached after SetupIntent confirm
    });

    // Fetch card details
    const pm = await getPaymentMethod(args.paymentMethodId);
    if (!pm.card) {
      throw new ConvexError({
        message: 'Only card payment methods are supported',
      });
    }

    // First card becomes default
    const existing = await ctx.runQuery(api.nursePayments.getPaymentMethods, {
      nurseId: args.nurseId,
    });
    const isDefault = existing.length === 0;

    await ctx.runMutation(internal.nursePayments.savePaymentMethod, {
      nurseId: args.nurseId,
      stripeCustomerId: args.stripeCustomerId,
      stripePaymentMethodId: pm.id,
      last4: pm.card.last4,
      brand: pm.card.brand,
      expMonth: pm.card.exp_month,
      expYear: pm.card.exp_year,
      isDefault,
    });

    return { success: true };
  },
});

/** Remove a saved payment method — detaches from Stripe and deletes from DB */
export const removePaymentMethod = action({
  args: {
    paymentMethodId: v.id('nursePaymentMethods'),
  },
  handler: async (ctx, args): Promise<{ success: boolean }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({ message: 'User not authenticated' });
    }

    const pm = await ctx.runQuery(api.nursePayments.getPaymentMethodById, {
      paymentMethodId: args.paymentMethodId,
    });
    if (!pm) {
      throw new ConvexError({ message: 'Payment method not found' });
    }

    await detachPaymentMethod(pm.stripePaymentMethodId);

    await ctx.runMutation(internal.nursePayments.deletePaymentMethod, {
      paymentMethodId: args.paymentMethodId,
    });

    return { success: true };
  },
});

/** Set a different card as the default */
export const setDefaultPaymentMethod = action({
  args: {
    paymentMethodId: v.id('nursePaymentMethods'),
    nurseId: v.id('nurses'),
  },
  handler: async (ctx, args): Promise<{ success: boolean }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({ message: 'User not authenticated' });
    }

    await ctx.runMutation(internal.nursePayments.updatePaymentMethodDefault, {
      paymentMethodId: args.paymentMethodId,
      nurseId: args.nurseId,
    });

    return { success: true };
  },
});
