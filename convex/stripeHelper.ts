'use node';

import { ConvexError } from 'convex/values';

const STRIPE_BASE = 'https://api.stripe.com/v1';

// ── DRY fetch helper ─────────────────────────────────────────────────────────

async function stripeRequest<T = any>(
  method: 'GET' | 'POST' | 'DELETE',
  path: string,
  body?: Record<string, any>,
): Promise<T> {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new ConvexError({ message: 'Stripe secret key not configured' });
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${secretKey}`,
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  const init: RequestInit = {
    method,
    headers,
  };

  if (body && method !== 'GET') {
    init.body = encodeFormBody(body);
  }

  const res = await fetch(`${STRIPE_BASE}${path}`, init);
  const json = await res.json();

  if (!res.ok) {
    throw new ConvexError({
      message: json?.error?.message ?? 'Stripe request failed',
    });
  }

  return json as T;
}

/** Recursively encode a nested object as application/x-www-form-urlencoded */
function encodeFormBody(obj: Record<string, any>, prefix = ''): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null) continue;
    const fullKey = prefix ? `${prefix}[${key}]` : key;
    if (typeof value === 'object' && !Array.isArray(value)) {
      parts.push(encodeFormBody(value, fullKey));
    } else if (Array.isArray(value)) {
      value.forEach((v, i) => {
        parts.push(
          `${encodeURIComponent(`${fullKey}[${i}]`)}=${encodeURIComponent(v)}`,
        );
      });
    } else {
      parts.push(`${encodeURIComponent(fullKey)}=${encodeURIComponent(value)}`);
    }
  }
  return parts.join('&');
}

// ── Customer ─────────────────────────────────────────────────────────────────

export async function createStripeCustomer(
  name: string,
  email: string,
  nurseId: string,
): Promise<{ id: string }> {
  return stripeRequest('POST', '/customers', {
    name,
    email,
    metadata: { nurseId },
  });
}

// ── SetupIntent ──────────────────────────────────────────────────────────────

export async function createSetupIntent(
  customerId: string,
): Promise<{ id: string; client_secret: string }> {
  return stripeRequest('POST', '/setup_intents', {
    customer: customerId,
    usage: 'off_session',
    'payment_method_types[]': 'card',
  });
}

// ── Retrieve PaymentMethod from SetupIntent ──────────────────────────────────

export async function retrieveSetupIntent(setupIntentId: string): Promise<{
  id: string;
  status: string;
  payment_method: string | null;
}> {
  return stripeRequest('GET', `/setup_intents/${setupIntentId}`);
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
  return stripeRequest('GET', `/payment_methods/${pmId}`);
}

// ── Attach PaymentMethod to Customer ────────────────────────────────────────

export async function attachPaymentMethodToCustomer(
  pmId: string,
  customerId: string,
): Promise<{ id: string }> {
  return stripeRequest('POST', `/payment_methods/${pmId}/attach`, {
    customer: customerId,
  });
}

// ── Detach PaymentMethod ─────────────────────────────────────────────────────

export async function detachPaymentMethod(pmId: string): Promise<void> {
  await stripeRequest('POST', `/payment_methods/${pmId}/detach`);
}

// ── Off-session PaymentIntent (commission charge) ────────────────────────────

export async function chargeOffSession(
  customerId: string,
  paymentMethodId: string,
  amountCents: number,
  currency: string = 'usd',
  description: string,
): Promise<{ id: string; status: string }> {
  return stripeRequest('POST', '/payment_intents', {
    amount: amountCents,
    currency,
    customer: customerId,
    payment_method: paymentMethodId,
    off_session: 'true',
    confirm: 'true',
    description,
  });
}
