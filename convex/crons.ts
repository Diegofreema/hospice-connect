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

// Fires at midnight UTC each day — catches all assignments where exactly 5 days
// have elapsed since completion (window: >= 5 days and < 6 days).
crons.daily(
  'send notification on 5th day',
  { hourUTC: 0, minuteUTC: 0 },
  internal.nurses.sendNotificationsToNursesOnFifthDay,
  {
    numItems: 500,
    cursor: null,
  },
);

// Fires at midnight UTC each day — catches assignments exactly on day 6
// (window: >= 6 days and < 7 days).
crons.daily(
  'send notification on 6th day',
  { hourUTC: 0, minuteUTC: 0 },
  internal.nurses.sendNotificationsToNursesOnSixthDay,
  {
    numItems: 500,
    cursor: null,
  },
);

// Fires at midnight UTC each day — catches assignments exactly on day 7
// (window: >= 7 days and < 8 days) and suspends the nurse's account.
crons.daily(
  'send notification on 7th day and suspend account',
  { hourUTC: 0, minuteUTC: 0 },
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
