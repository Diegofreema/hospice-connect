import { v } from 'convex/values';
import { action } from './_generated/server';
import { authComponent } from './auth';
import { resend } from './sendEmail';

export const submitSupportTicket = action({
  args: {
    subject: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      throw new Error('Not authenticated');
    }

    const senderName = user.name || 'Unknown User';
    const senderEmail = user.email || 'No Email';

    await resend.sendEmail(ctx, {
      from: 'HospiceConnect <support@hospice-connect.net>',
      to: 'info@hospice-connect.net',
      subject: `[Support Ticket] ${args.subject}`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Support Ticket</title>
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
              font-size: 24px;
            }
            .content {
              padding: 40px 30px;
              text-align: left;
            }
            .info-text {
              color: #666666;
              font-size: 16px;
              line-height: 1.6;
              margin-bottom: 15px;
              margin-top: 0;
            }
            .label {
              font-weight: 600;
              color: #333333;
            }
            .message-box {
              background-color: #f9fafc;
              padding: 20px;
              border-radius: 8px;
              border: 1px solid #e1e5eb;
              margin-top: 15px;
              white-space: pre-wrap;
              color: #333333;
              font-size: 15px;
              line-height: 1.6;
            }
            .footer {
              background-color: #f4f7fa;
              padding: 20px;
              text-align: center;
              font-size: 12px;
              color: #999999;
            }
            .footer p {
              margin: 5px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Support Ticket</h1>
            </div>
            <div class="content">
              <p class="info-text"><span class="label">From:</span> ${senderName} (${senderEmail})</p>
              <p class="info-text"><span class="label">Subject:</span> ${args.subject}</p>
              
              <div style="margin-top: 30px;">
                <p class="info-text label">Message:</p>
                <div class="message-box">${args.message}</div>
              </div>
            </div>
            <div class="footer">
              <p>This email was sent from HospiceConnect.</p>
              <p>© ${new Date().getFullYear()} HospiceConnect. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    return { success: true };
  },
});
