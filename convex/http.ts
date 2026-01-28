import { httpRouter } from 'convex/server';

// import { auth } from './auth';
import { authComponent, createAuth } from './auth';
// import { resend } from './sendEmail';

const http = httpRouter();

// auth.addHttpRoutes(http);
authComponent.registerRoutes(http, createAuth, { cors: true });
// http.route({
//   path: '/resend-webhook',
//   method: 'POST',
//   handler: httpAction(async (ctx, req) => {
//     return await resend.handleResendEventWebhook(ctx, req);
//   }),
// });
export default http;
