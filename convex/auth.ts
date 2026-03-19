import { expo } from '@better-auth/expo';
import { createClient, type GenericCtx } from '@convex-dev/better-auth';
import { convex, crossDomain } from '@convex-dev/better-auth/plugins';
import { betterAuth, type BetterAuthOptions } from 'better-auth';
import { emailOTP } from 'better-auth/plugins';
import type { DataModel } from './_generated/dataModel';

import { requireActionCtx } from '@convex-dev/better-auth/utils';
import { components } from './_generated/api';
import { query } from './_generated/server';
import authConfig from './auth.config';
import authSchema from './betterAuth/schema';
import { sendEmailVerification, sendResetPassword } from './sendEmail';

const siteUrl = process.env.SITE_URL!;
const nativeAppUrl = process.env.NATIVE_APP_URL || 'hospice-connect://';
const isDevelopment = process.env.NODE_ENV === 'development';
const urlToUse = isDevelopment ? 'http://localhost:8081' : siteUrl;
export const authComponent = createClient<DataModel, typeof authSchema>(
  components.betterAuth,
  {
    local: {
      schema: authSchema,
    },
  },
);

export const createAuthOptions = (ctx: GenericCtx<DataModel>) => {
  return {
    baseURL: siteUrl,
    trustedOrigins: [
      'https://appleid.apple.com',
      urlToUse,
      nativeAppUrl,
      ...(isDevelopment
        ? [
            'exp://*/*', // Trust all Expo development URLs
            'exp://10.0.0.*:*/*', // Trust 10.0.0.x IP range
            'exp://192.168.*.*:*/*', // Trust 192.168.x.x IP range
            'exp://172.*.*.*:*/*', // Trust 172.x.x.x IP range
            'exp://localhost:*/*', // Trust localhost
            'http://localhost:3000',
            'http://localhost:3001',
            'http://localhost:8082',
            'http://localhost:8081',
          ]
        : []),
    ],
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      sendResetPassword: async ({ user, url }) => {
        await sendResetPassword(requireActionCtx(ctx), {
          to: user.email,
          url,
          expires: Date.now() + 15 * 60 * 1000,
          name: user.name,
        });
      },
    },
    socialProviders: {
      google: {
        clientId: process.env.AUTH_GOOGLE_ID as string,
        clientSecret: process.env.AUTH_GOOGLE_SECRET as string,
      },
      apple: {
        clientId: 'com.hospiceconnect.hospiceconnect.si',
        clientSecret: process.env.AUTH_APPLE_SECRET as string,
      },
    },
    account: {
      accountLinking: {
        enabled: true,
      },
    },
    plugins: [
      expo(),
      convex({ authConfig }),
      crossDomain({ siteUrl }),
      emailOTP({
        async sendVerificationOTP({ email, otp, type }) {
          if (type === 'sign-in') {
            // Send the OTP for sign in
          } else if (type === 'email-verification') {
            // Send the OTP for email verification
            await sendEmailVerification(requireActionCtx(ctx), {
              to: email,
              code: otp,
              expires: Date.now() + 15 * 60 * 1000,
            });
          } else {
            // Send the OTP for password reset
          }
        },
      }),
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
  } satisfies BetterAuthOptions;
};

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth(createAuthOptions(ctx));
};

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return await authComponent.safeGetAuthUser(ctx);
  },
});

export const { getAuthUser } = authComponent.clientApi();
