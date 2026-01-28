import { Resend } from '@convex-dev/resend';
import { pretty, render } from '@react-email/components';
import { components, internal } from './_generated/api';
import { type ActionCtx } from './_generated/server';
import { ResetPasswordEmail } from './emails/ResetPasswordEmail';
import { VerifyEmail } from './emails/VerifyEmail';

export const resend: Resend = new Resend(components.resend, {
  onEmailEvent: internal.handleEvent.handleEmailEvent,
  testMode: false,
  webhookSecret: process.env.RESEND_WEBHOOK_SECRET ?? '',
  apiKey: process.env.RESEND_API_KEY ?? '',
});

const sendEmail = async (
  ctx: ActionCtx,
  {
    to,
    subject,
    html,
  }: {
    to: string;
    subject: string;
    html: string;
  }
) => {
  await resend.sendEmail(ctx, {
    from: 'HospiceConnect <innovate@learnfactory.com.ng>',
    to,
    subject,
    html,
  });
};
export const sendEmailVerification = async (
  ctx: ActionCtx,
  {
    to,
    code,
    expires,
  }: {
    to: string;
    code: string;
    expires: number;
  }
) => {
  const html = await pretty(
    await render(<VerifyEmail code={code} expires={new Date(expires)} />)
  );
  await sendEmail(ctx, {
    to,
    subject: `Hi ${name}, Welcome to HospiceConnect! Verify your email`,
    html,
  });
};

export const sendResetPassword = async (
  ctx: ActionCtx,
  {
    to,
    url,
    expires,
    name,
  }: {
    to: string;
    url: string;
    expires: number;
    name: string;
  }
) => {
  await sendEmail(ctx, {
    to,
    subject: 'Reset your password',
    html: await render(
      <ResetPasswordEmail
        url={url}
        expires={new Date(expires)}
        userName={name}
      />
    ),
  });
};
