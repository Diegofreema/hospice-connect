import { expo } from '@better-auth/expo';
import {
  AuthFunctions,
  createClient,
  type GenericCtx,
} from '@convex-dev/better-auth';
import { convex } from '@convex-dev/better-auth/plugins';
import { requireActionCtx } from '@convex-dev/better-auth/utils';
import { betterAuth } from 'better-auth';
import { components, internal } from './_generated/api';
import { DataModel } from './_generated/dataModel';
import authSchema from './betterAuth/schema';
import { sendResetPassword } from './sendEmail';
const authFunctions: AuthFunctions = internal.auth;

// The component client has methods needed for integrating Convex with Better Auth,
// as well as helper methods for general use.
export const authComponent = createClient<DataModel, typeof authSchema>(
  components.betterAuth,
  {
    authFunctions,
    triggers: {
      user: {
        onCreate: async (ctx, doc) => {},
      },
    },
    local: {
      schema: authSchema,
    },
  }
);

export const createAuth = (
  ctx: GenericCtx<DataModel>,
  { optionsOnly } = { optionsOnly: false }
) => {
  return betterAuth({
    // disable logging when createAuth is called just to generate options.
    // this is not required, but there's a lot of noise in logs without it.
    logger: {
      disabled: optionsOnly,
    },
    socialProviders: {
      google: {
        clientId: process.env.AUTH_GOOGLE_ID as string,
        clientSecret: process.env.AUTH_GOOGLE_SECRET as string,
      },
    },
    account: {
      accountLinking: {
        enabled: true,
      },
    },
    trustedOrigins: [
      'hospiceconnect://',
      ...(process.env.NODE_ENV === 'development'
        ? [
            'exp://*/*', // Trust all Expo development URLs
            'exp://10.0.0.*:*/*', // Trust 10.0.0.x IP range
            'exp://192.168.*.*:*/*', // Trust 192.168.x.x IP range
            'exp://172.*.*.*:*/*', // Trust 172.x.x.x IP range
            'exp://localhost:*/*', // Trust localhost
          ]
        : []),
    ],
    database: authComponent.adapter(ctx),
    // Configure simple, non-verified email/password to get started
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
      sendResetPassword: async ({ user, url, token }, request) => {
        await sendResetPassword(requireActionCtx(ctx), {
          to: user.email,
          code: token,
          expires: Date.now() + 15 * 60 * 1000,
        });
      },
    },
    plugins: [
      // The Expo and Convex plugins are required
      expo(),
      convex(),
    ],
    user: {
      additionalFields: {
        role: {
          required: true,
          defaultValue: 'nurse',
          type: 'string',
        },
        isBoarded: {
          type: 'boolean',
          defaultValue: false,
          required: true,
        },
        streamToken: {
          type: 'string',
          required: false,
        },
      },
    },
  });
};

// Example function for getting the current user
// Feel free to edit, omit, etc.
export const { onCreate, onUpdate, onDelete } = authComponent.triggersApi();
