import { v } from 'convex/values';
import { action } from './_generated/server';
import { resend } from './sendEmail';
import { authComponent } from './auth';

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
      from: 'HospiceConnect Support <innovate@learnfactory.com.ng>',
      to: 'support@hospice.com',
      subject: `[Support Ticket] ${args.subject}`,
      html: `
        <div style="font-family: sans-serif; line-height: 1.5; color: #333;">
          <h2>New Support Ticket</h2>
          <p><strong>From:</strong> ${senderName} (${senderEmail})</p>
          <p><strong>Subject:</strong> ${args.subject}</p>
          <hr />
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap;">${args.message}</p>
          <hr />
          <p style="font-size: 0.8em; color: #777;">This email was sent from the HospiceConnect Support Screen.</p>
        </div>
      `,
    });

    return { success: true };
  },
});
