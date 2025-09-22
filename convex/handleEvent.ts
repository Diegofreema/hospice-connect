import { vOnEmailEventArgs } from '@convex-dev/resend';
import { internalMutation } from './_generated/server';

export const handleEmailEvent = internalMutation({
  args: vOnEmailEventArgs,
  handler: async (ctx, args) => {
    // Handle however you want
    // args provides { id: EmailId; event: EmailEvent; }
    // see /example/example.ts
    console.log('Got called back!', args.id, args.event);
  },
});
