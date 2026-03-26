'use node';

import { ConvexError } from 'convex/values';
import Stripe from 'stripe';

const getStripe = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new ConvexError({ message: 'Stripe secret key not configured' });
  }
  return new Stripe(secretKey, {
    apiVersion: '2025-02-24.acacia' as any,
  });
};

// ── Customer ─────────────────────────────────────────────────────────────────

export async function createStripeCustomer(
  name: string,
  email: string,
  nurseId: string,
): Promise<{ id: string }> {
  const stripe = getStripe();
  return stripe.customers.create({
    name,
    email,
    metadata: { nurseId },
  });
}

export async function getStripeCustomer(customerId: string) {
  const stripe = getStripe();
  return stripe.customers.retrieve(customerId) as Promise<Stripe.Customer>;
}

// ── SetupIntent ──────────────────────────────────────────────────────────────

export async function createSetupIntent(
  customerId: string,
): Promise<{ id: string; client_secret: string }> {
  const stripe = getStripe();
  const si = await stripe.setupIntents.create({
    customer: customerId,
    usage: 'off_session',
    payment_method_types: ['card'],
  });
  return { id: si.id, client_secret: si.client_secret! };
}

// ── Retrieve PaymentMethod from SetupIntent ──────────────────────────────────

export async function retrieveSetupIntent(setupIntentId: string): Promise<{
  id: string;
  status: string;
  payment_method: string | null;
}> {
  const stripe = getStripe();
  const res = await stripe.setupIntents.retrieve(setupIntentId);
  return {
    id: res.id,
    status: res.status,
    payment_method:
      typeof res.payment_method === 'string'
        ? res.payment_method
        : res.payment_method?.id || null,
  };
}

// ── Get PaymentMethod details ────────────────────────────────────────────────

export async function getPaymentMethod(pmId: string): Promise<{
  id: string;
  card: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
}> {
  const stripe = getStripe();
  const res = await stripe.paymentMethods.retrieve(pmId);
  if (!res.card) {
    throw new ConvexError({ message: 'Payment method is not a card' });
  }
  return {
    id: res.id,
    card: {
      brand: res.card.brand,
      last4: res.card.last4,
      exp_month: res.card.exp_month,
      exp_year: res.card.exp_year,
    },
  };
}

// ── Attach PaymentMethod to Customer ────────────────────────────────────────

export async function attachPaymentMethodToCustomer(
  pmId: string,
  customerId: string,
): Promise<{ id: string }> {
  const stripe = getStripe();
  return stripe.paymentMethods.attach(pmId, {
    customer: customerId,
  });
}

// ── Detach PaymentMethod ─────────────────────────────────────────────────────

export async function detachPaymentMethod(pmId: string): Promise<void> {
  const stripe = getStripe();
  await stripe.paymentMethods.detach(pmId);
}

// ── List Customer's Payment Methods ──────────────────────────────────────────

export type StripeCard = {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
};

export async function listCustomerPaymentMethods(
  customerId: string,
  defaultPmId?: string | null,
): Promise<StripeCard[]> {
  const stripe = getStripe();
  const result = await stripe.paymentMethods.list({
    customer: customerId,
    type: 'card',
  });
  return result.data.map((pm) => ({
    id: pm.id,
    brand: pm.card?.brand ?? 'unknown',
    last4: pm.card?.last4 ?? '****',
    expMonth: pm.card?.exp_month ?? 0,
    expYear: pm.card?.exp_year ?? 0,
    isDefault: pm.id === defaultPmId,
  }));
}

// ── Set Customer's Default Payment Method ────────────────────────────────────

export async function setDefaultPaymentMethodOnCustomer(
  customerId: string,
  pmId: string,
): Promise<void> {
  const stripe = getStripe();
  await stripe.customers.update(customerId, {
    invoice_settings: { default_payment_method: pmId },
  });
}

// ── Off-session PaymentIntent (commission charge) ────────────────────────────

export async function chargeOffSession(
  customerId: string,
  paymentMethodId: string,
  amountCents: number,
  currency: string = 'usd',
  description: string,
): Promise<{ id: string; status: string }> {
  const stripe = getStripe();
  
  // This is the implementation via Stripe SDK (as requested)
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountCents,
    currency,
    customer: customerId,
    payment_method: paymentMethodId,
    off_session: true, // Important for charging without the customer present
    confirm: true,
    description,
  });
  
  return { id: paymentIntent.id, status: paymentIntent.status };
}
