import Resend from '@auth/core/providers/resend';
import { RandomReader, generateRandomString } from '@oslojs/crypto/random';
import { Resend as ResendAPI } from 'resend';
import VerifyEmail from './VerifyEmail';

export const ResendOTP = Resend({
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
      from: 'HospiceConnect <info@hospice-connect.net>',
      to: [email],
      subject: `Verify your email`,
      react: VerifyEmail({
        code: token,

        expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
      }),
    });
    console.log({ error });

    if (error) {
      throw new Error('Could not send verification code');
    }
  },
});
