import Google from '@auth/core/providers/google';
import Resend from '@auth/core/providers/resend';
import { Password } from '@convex-dev/auth/providers/Password';
import { convexAuth } from '@convex-dev/auth/server';
import { ConvexError } from 'convex/values';
import { DataModel } from './_generated/dataModel.d';

import { z } from 'zod';
import { INVALID_PASSWORD } from './errors';
import { ResendOTP } from './ResendOTP';
import { ResendOTPPasswordReset } from './ResendOTPPassword';
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
          throw new ConvexError(error.format());
        }
        return {
          email: data.email as string,
          name: params.firstName + ' ' + params.lastName,
          admin: false,
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
});
