// in convex/crons.ts
import { cronJobs } from 'convex/server';
import { components, internal } from './_generated/api.js';
import { internalMutation } from './_generated/server.js';

const crons = cronJobs();
crons.interval(
  'Remove old emails from the resend component',
  { hours: 24 },
  internal.crons.cleanupResend,
);

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
export const cleanupResend = internalMutation({
  args: {},
  handler: async (ctx) => {
    await ctx.scheduler.runAfter(0, components.resend.lib.cleanupOldEmails, {
      olderThan: ONE_WEEK_MS,
    });
    await ctx.scheduler.runAfter(
      0,
      components.resend.lib.cleanupAbandonedEmails,
      // These generally indicate a bug, so keep them around for longer.
      { olderThan: 4 * ONE_WEEK_MS },
    );
  },
});
// crons.interval(
//   'update nurses assignment',
//   { minutes: 2 }, // every minute
//   internal.assignments.updateNursesAssignment
// );

crons.interval(
  'send notification on 5th day',
  { hours: 24 },
  internal.nurses.sendNotificationsToNursesOnFifthDay,
  {
    numItems: 500,
    cursor: null,
  },
);

crons.interval(
  'send notification on 6th day',
  { hours: 24 },
  internal.nurses.sendNotificationsToNursesOnSixthDay,
  {
    numItems: 500,
    cursor: null,
  },
);

crons.interval(
  'send notification on 7th day and suspend account',
  { hours: 24 },
  internal.nurses.sendNotificationsToNursesAndSuspendAccount,
  {
    numItems: 500,
    cursor: null,
  },
);
// crons.interval(
//   'update route sheet status',
//   { minutes: 1 },
//   internal.routeSheets.updateRouteSheetStatus,
// );

// crons.interval(
//   'update count pending',
//   { minutes: 1 },
//   internal.nurses.updateCountPending,
// );

export default crons;
