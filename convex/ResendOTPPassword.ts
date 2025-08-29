import Resend from '@auth/core/providers/resend';
import { RandomReader, generateRandomString } from '@oslojs/crypto/random';
import { Resend as ResendAPI } from 'resend';
import { ResetPasswordTemplate } from './passwordReset/PasswordResetemail';

export const ResendOTPPasswordReset = Resend({
  id: 'resend-otp',
  apiKey: process.env.AUTH_RESEND_KEY,
  async generateVerificationToken() {
    const random: RandomReader = {
      read(bytes) {
        crypto.getRandomValues(bytes);
      },
    };

    const alphabet = '0123456789';
    const length = 5;
    return generateRandomString(random, alphabet, length);
  },
  async sendVerificationRequest({ identifier: email, provider, token }) {
    const resend = new ResendAPI(provider.apiKey);
    const { error } = await resend.emails.send({
      from: 'HospiceConnect <innovate@learnfactory.com.ng>',
      to: [email],
      subject: `Reset your password`,
      react: ResetPasswordTemplate({
        code: token,
        userEmail: email,
      }),
    });

    if (error) {
      throw new Error('Email could not be found');
    }
  },
});
