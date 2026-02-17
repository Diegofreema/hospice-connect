import { ConvexError, v } from 'convex/values';
import { api } from './_generated/api';
import { action, internalMutation, query } from './_generated/server';
import { getUserHelperFn } from './helper';

// Internal mutations for database operations
const savePaymentMethod = internalMutation({
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

const updateNurseStripeCustomer = internalMutation({
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

const deletePaymentMethod = internalMutation({
  args: {
    paymentMethodId: v.id('nursePaymentMethods'),
  },
  handler: async (ctx, args) => {
    const paymentMethod = await ctx.db.get(args.paymentMethodId);
    if (!paymentMethod) {
      throw new ConvexError({ message: 'Payment method not found' });
    }

    await ctx.db.delete(args.paymentMethodId);

    // If this was the default, set another as default
    if (paymentMethod.isDefault) {
      const remainingMethods = await ctx.db
        .query('nursePaymentMethods')
        .withIndex('by_nurse', (q) => q.eq('nurseId', paymentMethod.nurseId))
        .collect();

      if (remainingMethods.length > 0) {
        await ctx.db.patch(remainingMethods[0]._id, { isDefault: true });
      }
    }
  },
});

const updatePaymentMethodDefault = internalMutation({
  args: {
    paymentMethodId: v.id('nursePaymentMethods'),
    nurseId: v.id('nurses'),
  },
  handler: async (ctx, args) => {
    // Remove default from all other payment methods
    const allMethods = await ctx.db
      .query('nursePaymentMethods')
      .withIndex('by_nurse', (q) => q.eq('nurseId', args.nurseId))
      .collect();

    for (const method of allMethods) {
      if (method._id !== args.paymentMethodId) {
        await ctx.db.patch(method._id, { isDefault: false });
      }
    }

    // Set new default
    await ctx.db.patch(args.paymentMethodId, { isDefault: true });
  },
});

// Actions for Stripe API operations
export const addPaymentMethod = action({
  args: {
    nurseId: v.id('nurses'),
    paymentMethodId: v.string(), // Stripe payment method ID from frontend
  },
  handler: async (ctx, args) => {
    // const identity = await ctx.auth.getUserIdentity();
    // if (!identity) {
    //   throw new ConvexError({ message: 'User not authenticated' });
    // }
    // const nurse = await ctx.runQuery(api.nurses.getNurseById, {
    //   nurseId: args.nurseId,
    // });
    // if (!nurse) {
    //   throw new ConvexError({ message: 'Nurse not found' });
    // }
    // // Ensure nurse has a Stripe customer
    // let stripeCustomerId = nurse.stripeCustomerId;
    // if (!stripeCustomerId) {
    //   // Create new Stripe customer using component action
    //   const customer = await components.stripe.actions.customers.create({
    //     email: nurse.email,
    //     name: nurse.name,
    //     metadata: {
    //       nurseId: args.nurseId,
    //       userId: identity.subject,
    //     },
    //   });
    //   stripeCustomerId = customer.id;
    //   // Save customer ID to nurse record
    //   await ctx.runMutation(api.nursePayments.updateNurseStripeCustomer, {
    //     nurseId: args.nurseId,
    //     stripeCustomerId: customer.id,
    //   });
    // }
    // // Attach payment method to customer
    // const paymentMethod = await components.stripe.actions.paymentMethods.attach(
    //   args.paymentMethodId,
    //   {
    //     customer: stripeCustomerId,
    //   },
    // );
    // // Check if this is the first payment method (make it default)
    // const existingMethods = await ctx.runQuery(
    //   api.nursePayments.getPaymentMethods,
    //   {
    //     nurseId: args.nurseId,
    //   },
    // );
    // const isFirst = existingMethods.length === 0;
    // // Save payment method to database
    // const card = paymentMethod.card;
    // if (!card) {
    //   throw new ConvexError({ message: 'Invalid payment method type' });
    // }
    // await ctx.runMutation(api.nursePayments.savePaymentMethod, {
    //   nurseId: args.nurseId,
    //   stripeCustomerId: stripeCustomerId,
    //   stripePaymentMethodId: paymentMethod.id,
    //   last4: card.last4,
    //   brand: card.brand,
    //   expMonth: card.exp_month,
    //   expYear: card.exp_year,
    //   isDefault: isFirst,
    // });
    // return { success: true, paymentMethodId: paymentMethod.id };
  },
});

// Remove payment method
export const removePaymentMethod = action({
  args: {
    paymentMethodId: v.id('nursePaymentMethods'),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({ message: 'User not authenticated' });
    }

    const paymentMethod = await ctx.runQuery(
      api.nursePayments.getPaymentMethodById,
      { paymentMethodId: args.paymentMethodId },
    );

    if (!paymentMethod) {
      throw new ConvexError({ message: 'Payment method not found' });
    }

    // Detach from Stripe
    // await components.stripe.actions.paymentMethods.detach(
    //   paymentMethod.stripePaymentMethodId,
    // );

    // // Delete from database
    // await ctx.runMutation(api.nursePayments.deletePaymentMethod, {
    //   paymentMethodId: args.paymentMethodId,
    // });

    return { success: true };
  },
});

// Set default payment method
export const setDefaultPaymentMethod = action({
  args: {
    paymentMethodId: v.id('nursePaymentMethods'),
    nurseId: v.id('nurses'),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({ message: 'User not authenticated' });
    }

    // await ctx.runMutation(api.nursePayments.updatePaymentMethodDefault, {
    //   paymentMethodId: args.paymentMethodId,
    //   nurseId: args.nurseId,
    // });

    return { success: true };
  },
});

// Queries
export const getPaymentMethods = query({
  args: { nurseId: v.id('nurses') },
  handler: async (ctx, args) => {
    const user = await getUserHelperFn(ctx);
    if (!user) {
      throw new ConvexError({ message: 'User not authenticated' });
    }

    const paymentMethods = await ctx.db
      .query('nursePaymentMethods')
      .withIndex('by_nurse', (q) => q.eq('nurseId', args.nurseId))
      .collect();

    return paymentMethods;
  },
});

export const getPaymentMethodById = query({
  args: { paymentMethodId: v.id('nursePaymentMethods') },
  handler: async (ctx, args) => {
    const user = await getUserHelperFn(ctx);
    if (!user) {
      throw new ConvexError({ message: 'User not authenticated' });
    }

    return await ctx.db.get(args.paymentMethodId);
  },
});

// Export internal mutations for use by actions
export {
  deletePaymentMethod,
  savePaymentMethod,
  updateNurseStripeCustomer,
  updatePaymentMethodDefault,
};
