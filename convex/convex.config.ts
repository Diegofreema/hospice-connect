import resend from '@convex-dev/resend/convex.config';
import stripe from '@convex-dev/stripe/convex.config.js';
import { defineApp } from 'convex/server';
import betterAuth from './betterAuth/convex.config';

const app = defineApp();
app.use(stripe);

app.use(betterAuth);
app.use(resend);
export default app;
