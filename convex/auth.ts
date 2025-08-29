import Google from '@auth/core/providers/google';
import Resend from '@auth/core/providers/resend';
import { Password } from '@convex-dev/auth/providers/Password';
import { convexAuth } from '@convex-dev/auth/server';
import { ConvexError } from 'convex/values';
import { DataModel } from './_generated/dataModel.d';
import { MutationCtx } from './_generated/server.d';

import { z } from 'zod';
import { INVALID_PASSWORD } from './errors';
import { ResendOTP } from './ResendOTP';
import { ResendOTPPasswordReset } from './ResendOTPPassword';
import { findUserByEmail } from './users';
const ParamsSchema = z.object({
  email: z.email(),
});
export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Google,
    Password<DataModel>({
      id: 'password-custom',
      profile(params, _ctx) {
        const { error, data } = ParamsSchema.safeParse(params);
        if (error) {
          console.log('error-reg', error);
          throw new ConvexError(error.message);
        }
        return {
          email: data.email as string,
          name: params.firstName + ' ' + params.lastName,
          isBoarded: false,
          isNurse: false,
        };
      },
      validatePasswordRequirements: (password: string) => {
        let checksCount = 0;

        if (password && password.length >= 6) {
          checksCount++;
        }

        if (/\d/.test(password)) {
          checksCount++;
        }

        if (/[a-z]/.test(password)) {
          checksCount++;
        }

        if (/[A-Z]/.test(password)) {
          checksCount++;
        }

        if (/[^A-Za-z0-9]/.test(password)) {
          checksCount++;
        }

        if (checksCount < 4) {
          throw new ConvexError(INVALID_PASSWORD);
        }
      },
      verify: ResendOTP,
      reset: ResendOTPPasswordReset,
    }),
    Resend({
      from:
        process.env.AUTH_EMAIL ??
        'HospiceConnect <innovate@learnfactory.com.ng>',
    }),
  ],
  callbacks: {
    // `args.type` is one of "oauth" | "email" | "phone" | "credentials" | "verification"
    // `args.provider` is the currently used provider config
    async createOrUpdateUser(ctx: MutationCtx, args) {
      console.log({ args: args.profile });
      if (args.existingUserId) {
        // Optionally merge updated fields into the existing user object here
        return args.existingUserId;
      }

      // Implement your own account linking logic:
      const existingUser = await findUserByEmail(
        ctx,
        args.profile.email as string
      );

      if (existingUser) return existingUser._id;

      // Implement your own user creation:
      return ctx.db.insert('users', {
        email: args.profile.email as string,
        name: args.profile.name as string,
        image: args.profile.picture as string,
        emailVerificationTime: args.profile.emailVerificationTime as number,
        isBoarded: false,
        isNurse: false,
      });
    },
  },
});
