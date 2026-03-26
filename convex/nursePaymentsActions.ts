'use node';

import { ConvexError, v } from 'convex/values';
import { api, internal } from './_generated/api';
import { action } from './_generated/server';
import {
  attachPaymentMethodToCustomer,
  createSetupIntent,
  createStripeCustomer,
  detachPaymentMethod,
  getStripeCustomer,
  listCustomerPaymentMethods,
  setDefaultPaymentMethodOnCustomer,
  type StripeCard,
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
 * Attaches the payment method to the Stripe customer — no DB writes.
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

    return { success: true };
  },
});

/**
 * Fetch all saved cards for a nurse directly from Stripe.
 * Stripe is the single source of truth — nothing stored in Convex.
 */
export const getPaymentMethods = action({
  args: {
    nurseId: v.id('nurses'),
  },
  handler: async (ctx, args): Promise<StripeCard[]> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({ message: 'User not authenticated' });
    }

    const nurse = await ctx.runQuery(api.nurses.getNurseById, {
      userId: identity.subject,
    });
    if (!nurse || !nurse.stripeCustomerId) {
      return [];
    }

    // Fetch the customer to get the default PM
    const customer = await getStripeCustomer(nurse.stripeCustomerId);
    const defaultPmId =
      typeof customer.invoice_settings?.default_payment_method === 'string'
        ? customer.invoice_settings.default_payment_method
        : (customer.invoice_settings?.default_payment_method as any)?.id ??
          null;

    return listCustomerPaymentMethods(nurse.stripeCustomerId, defaultPmId);
  },
});

/** Remove a saved payment method — detaches from Stripe only. No DB write. */
export const removePaymentMethod = action({
  args: {
    stripePaymentMethodId: v.string(),
  },
  handler: async (ctx, args): Promise<{ success: boolean }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({ message: 'User not authenticated' });
    }

    await detachPaymentMethod(args.stripePaymentMethodId);

    return { success: true };
  },
});

/** Set a different card as the default — updates Stripe customer only. */
export const setDefaultPaymentMethod = action({
  args: {
    stripePaymentMethodId: v.string(),
    stripeCustomerId: v.string(),
  },
  handler: async (ctx, args): Promise<{ success: boolean }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({ message: 'User not authenticated' });
    }

    await setDefaultPaymentMethodOnCustomer(
      args.stripeCustomerId,
      args.stripePaymentMethodId,
    );

    return { success: true };
  },
});
