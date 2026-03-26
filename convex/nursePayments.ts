import { v } from 'convex/values';
import { internalMutation } from './_generated/server';

// ── Internal Mutations ────────────────────────────────────────────────────────

/** Persist the Stripe customer ID on the nurse record (one-time on first card add). */
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
