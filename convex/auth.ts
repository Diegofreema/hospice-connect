import { sendResetPassword } from './sendEmail';
// import Google from '@auth/core/providers/google';
// import Resend from '@auth/core/providers/resend';
// import { Password } from '@convex-dev/auth/providers/Password';
// import { convexAuth } from '@convex-dev/auth/server';
// import { ConvexError } from 'convex/values';
// import { DataModel } from './_generated/dataModel.d';
// import { MutationCtx } from './_generated/server.d';

// import { z } from 'zod';
// import { INVALID_PASSWORD } from './errors';
// import { ResendOTP } from './ResendOTP';
// import { ResendOTPPasswordReset } from './ResendOTPPassword';
// import { findUserByEmail } from './users';
// const ParamsSchema = z.object({
//   email: z.email(),
// });
// export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
//   providers: [
//     Google,
//     Password<DataModel>({
//       id: 'password-custom',
//       profile(params, _ctx) {
//         const { error, data } = ParamsSchema.safeParse(params);
//         if (error) {
//           console.log('error-reg', error);
//           throw new ConvexError(error.message);
//         }
//         return {
//           email: data.email as string,
//           name: params.firstName + ' ' + params.lastName,
//           isBoarded: false,
//           isNurse: false,
//         };
//       },
//       validatePasswordRequirements: (password: string) => {
//         let checksCount = 0;

//         if (password && password.length >= 6) {
//           checksCount++;
//         }

//         if (/\d/.test(password)) {
//           checksCount++;
//         }

//         if (/[a-z]/.test(password)) {
//           checksCount++;
//         }

//         if (/[A-Z]/.test(password)) {
//           checksCount++;
//         }

//         if (/[^A-Za-z0-9]/.test(password)) {
//           checksCount++;
//         }

//         if (checksCount < 4) {
//           throw new ConvexError(INVALID_PASSWORD);
//         }
//       },
//       verify: ResendOTP,
//       reset: ResendOTPPasswordReset,
//     }),
//     Resend({
//       from:
//         process.env.AUTH_EMAIL ??
//         'HospiceConnect <innovate@learnfactory.com.ng>',
//     }),
//   ],
//   callbacks: {
//     // `args.type` is one of "oauth" | "email" | "phone" | "credentials" | "verification"
//     // `args.provider` is the currently used provider config
//     async createOrUpdateUser(ctx: MutationCtx, args) {
//       console.log({ args: args.profile });
//       if (args.existingUserId) {
//         // Optionally merge updated fields into the existing user object here
//         return args.existingUserId;
//       }

//       // Implement your own account linking logic:
//       const existingUser = await findUserByEmail(
//         ctx,
//         args.profile.email as string
//       );

//       if (existingUser) return existingUser._id;

//       // Implement your own user creation:
//       return ctx.db.insert('users', {
//         email: args.profile.email as string,
//         name: args.profile.name as string,
//         image: args.profile.picture as string,
//         emailVerificationTime: args.profile.emailVerificationTime as number,
//         isBoarded: false,
//         isNurse: false,
//       });
//     },
//   },
// });

// // import { expo } from '@better-auth/expo';
// // import { createClient, type GenericCtx } from '@convex-dev/better-auth';
// // import { convex } from '@convex-dev/better-auth/plugins';
// // import { requireActionCtx } from '@convex-dev/better-auth/utils';
// // import { betterAuth } from 'better-auth';
// // import { emailOTP } from 'better-auth/plugins';
// // import { components } from './_generated/api';
// // import { DataModel } from './_generated/dataModel';
// // import { sendEmailVerification } from './sendEmail';
// // // The component client has methods needed for integrating Convex with Better Auth,
// // // as well as helper methods for general use.
// // export const authComponent = createClient<DataModel>(components.betterAuth);

// // export const createAuth = (
// //   ctx: GenericCtx<DataModel>,
// //   { optionsOnly } = { optionsOnly: false }
// // ) => {
// //   return betterAuth({
// //     // disable logging when createAuth is called just to generate options.
// //     // this is not required, but there's a lot of noise in logs without it.
// //     logger: {
// //       disabled: optionsOnly,
// //     },
// //     trustedOrigins: ['hospiceconnect://'],
// //     database: authComponent.adapter(ctx),
// //     // Configure simple, non-verified email/password to get started
// //     emailAndPassword: {
// //       enabled: true,
// //       requireEmailVerification: true,
// //       autoSignIn: false,
// //     },
// //     emailVerification: {
// //       sendVerificationEmail: async ({ user, token }) => {},
// //     },
// //     plugins: [
// //       emailOTP({
// //         async sendVerificationOTP({ email, otp }) {
// //           await sendEmailVerification(requireActionCtx(ctx), {
// //             to: email,
// //             code: otp,
// //             expires: Date.now() + 15 * 60 * 1000,
// //           });
// //         },
// //       }),
// //       // The Expo and Convex plugins are required
// //       expo(),
// //       convex(),
// //     ],
// //   });
// // };

// // export const { onCreate, onUpdate, onDelete } = authComponent.triggersApi();

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
