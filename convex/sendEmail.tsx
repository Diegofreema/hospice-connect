import { Resend } from '@convex-dev/resend';
import { render } from '@react-email/components';
import { components, internal } from './_generated/api';
import { type ActionCtx } from './_generated/server';
import { ResetPasswordEmail } from './emails/ResetPasswordEmail';

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
  },
) => {
  await resend.sendEmail(ctx, {
    from: 'HospiceConnect <support@hospice-connect.net>',
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
  },
) => {
  // const html = await pretty(
  //   await render(<VerifyEmail code={code} expires={new Date(expires)} />),
  // );
  await sendEmail(ctx, {
    to,
    subject: `Hi, Welcome to HospiceConnect! Verify your email`,
    html: `
    <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f4f7fa;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background-color: #4C55FF;
      padding: 40px 20px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 28px;
    }
    .content {
      padding: 40px 30px;
      text-align: center;
    }
    .otp-box {
      display: inline-block;
      background-color: #f4f7fa;
      padding: 20px 40px;
      border-radius: 12px;
      margin: 20px 0;
    }
    .otp-code {
      font-size: 36px;
      font-weight: 700;
      color: #005A5A;
      letter-spacing: 8px;
    }
    .info-text {
      color: #666666;
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 20px;
    }
    .footer {
      background-color: #f4f7fa;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #999999;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>HospiceConnect</h1>
    </div>
    <div class="content">
      <p class="info-text">We're excited to have you on board! To complete your registration, please verify your email address by entering the code below.</p>
      
      <div class="otp-box">
        <span class="otp-code">${code}</span>
      </div>
      
      <p class="info-text">This code will expire in 15 minutes.</p>
      
      <p class="info-text">If you didn't create this account, please ignore this email.</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} HospiceConnect. All rights reserved.</p>
    </div>
    </div>
  </div>
</body>
</html>
    `,
  });
};

export const sendResetPasswordOTP = async (
  ctx: ActionCtx,
  {
    to,
    code,
    expires,
  }: {
    to: string;
    code: string;
    expires: number;
  },
) => {
  await sendEmail(ctx, {
    to,
    subject: `Password Reset Request - HospiceConnect`,
    html: `
    <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f4f7fa;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background-color: #4C55FF;
      padding: 40px 20px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 28px;
    }
    .content {
      padding: 40px 30px;
      text-align: center;
    }
    .otp-box {
      display: inline-block;
      background-color: #f4f7fa;
      padding: 20px 40px;
      border-radius: 12px;
      margin: 20px 0;
    }
    .otp-code {
      font-size: 36px;
      font-weight: 700;
      color: #005A5A;
      letter-spacing: 8px;
    }
    .info-text {
      color: #666666;
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 20px;
    }
    .footer {
      background-color: #f4f7fa;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #999999;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>HospiceConnect</h1>
    </div>
    <div class="content">
      <p class="info-text">We received a request to reset your password. Please use the code below to securely reset it.</p>
      
      <div class="otp-box">
        <span class="otp-code">${code}</span>
      </div>
      
      <p class="info-text">This code will expire in 15 minutes.</p>
      
      <p class="info-text">If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} HospiceConnect. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `,
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
  },
) => {
  await sendEmail(ctx, {
    to,
    subject: 'Reset your password',
    html: await render(
      <ResetPasswordEmail
        url={url}
        expires={new Date(expires)}
        userName={name}
      />,
    ),
  });
};
