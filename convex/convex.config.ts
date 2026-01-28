import resend from '@convex-dev/resend/convex.config';
import shardedCounter from '@convex-dev/sharded-counter/convex.config.js';
import stripe from '@convex-dev/stripe/convex.config.js';
import { defineApp } from 'convex/server';
import betterAuth from './betterAuth/convex.config';
const app = defineApp();
app.use(stripe);
app.use(shardedCounter);

app.use(betterAuth);
app.use(resend);
export default app;
