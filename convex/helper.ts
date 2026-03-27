import { ConvexError, type Infer } from 'convex/values';
import { type Doc, type Id } from './_generated/dataModel';
import { mutation, type MutationCtx, type QueryCtx } from './_generated/server';

import { filter } from 'convex-helpers/server/filter';
import { components } from './_generated/api';
import { parseDateTimeWallClock } from './actionHelper';
import { authComponent } from './auth';
import { type Id as BetterAuthId } from './betterAuth/_generated/dataModel';
import { type day, type DisciplineType } from './schema';

export const getImage = (ctx: QueryCtx, imageId?: Id<'_storage'>) => {
  return imageId ? ctx.storage.getUrl(imageId) : null;
};

export type DayType = Infer<typeof day>;

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const getAvailability = async (
  ctx: QueryCtx,
  nurseId: Id<'nurses'>,
  day: string,
) => {
  const availabilities = await ctx.db
    .query('availabilities')
    .withIndex('nurseId', (q) => q.eq('nurseId', nurseId))
    .first();

  return availabilities?.days.find((d) => d.day === day);
};

export const getRatings = async (ctx: QueryCtx, nurseId: Id<'nurses'>) => {
  const ratings = await ctx.db
    .query('ratings')
    .withIndex('nurseId', (q) => q.eq('nurseId', nurseId))
    .collect();
  return ratings.reduce((acc, rating) => acc + rating.rate, 0) / ratings.length;
};
interface Shift {
  status: string;

  startTime: string;
  endTime: string;
  startDate: string;
  endDate: string;
  rate: number;
}
export function generateShifts(
  startDate: string, // e.g., '2025-09-30'
  endDate: string, // e.g., '2025-10-02'
  openingShiftTime: string, // e.g., '08:00'
  status: string = 'open',
  rate: number = 50,
): Shift[] {
  const shifts: Shift[] = [];

  // Parse input dates
  const start = new Date(`${startDate}T${openingShiftTime}:00.000Z`);
  const end = new Date(`${endDate}T23:59:59.999Z`); // Extend end date to end of day

  // Validate inputs
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error('Invalid start or end date');
  }
  if (start > end) {
    throw new Error('Start date must be before end date');
  }

  let current = new Date(start);

  while (current <= end) {
    // Calculate shift end time (12 hours later)
    const shiftEnd = new Date(current.getTime() + 12 * 60 * 60 * 1000);

    // If shift end exceeds end date, adjust to end date
    const effectiveEnd = shiftEnd <= end ? shiftEnd : end;

    // Format dates and times as ISO strings
    const startTime = current.toISOString();
    const endTime = effectiveEnd.toISOString();

    // Extract date part for startDate and endDate
    const startDateStr = startTime.split('T')[0];
    const endDateStr = endTime.split('T')[0];

    shifts.push({
      status,

      startTime,
      endTime,
      startDate: startDateStr,
      endDate: endDateStr,
      rate,
    });

    // Move to next shift (12 hours later)
    current = new Date(current.getTime() + 12 * 60 * 60 * 1000);

    // If next shift starts after midnight, align to next day's opening shift time
    if (current.getUTCHours() !== start.getUTCHours()) {
      current.setUTCDate(current.getUTCDate() + 1);
      current.setUTCHours(start.getUTCHours(), 0, 0, 0);
    }

    // Break if next shift starts after end date
    if (current > end) break;
  }

  return shifts;
}
export function stringToDate(dateString: string): Date {
  // Validate format with regex: DD-MM-YYYY
  const dateRegex = /^(\d{2})-(\d{2})-(\d{4})$/;
  if (!dateRegex.test(dateString)) {
    console.warn(`Invalid date format: "${dateString}". Expected DD-MM-YYYY.`);
    throw new Error(`Invalid date: "${dateString}".`);
  }

  // Split the string into day, month, year
  const [day, month, year] = dateString.split('-').map(Number);

  // Create Date object (month is 0-based in JS, so subtract 1)
  const date = new Date(year, month - 1, day);

  // Validate the date is valid (e.g., not 30-02-2025)
  if (
    date.getDate() !== day ||
    date.getMonth() !== month - 1 ||
    date.getFullYear() !== year
  ) {
    console.warn(`Invalid date: "${dateString}".`);
    throw new Error(`Invalid date: "${dateString}".`);
  }

  return date;
}
export function stringToDate2(dateString: string): Date {
  const dateRegex = /^(\d{2})-(\d{2})-(\d{4})$/;
  if (!dateRegex.test(dateString)) {
    throw new Error(`Invalid date format: "${dateString}"`);
  }

  const [day, month, year] = dateString.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}
export function convertTimeStringToDate(timeString: string) {
  // Get current date to use as base
  const now = new Date();

  // Parse the time string (e.g., "3:59 AM")
  const [time, period] = timeString.split(/\s+/);
  const [hours, minutes] = time.split(':').map(Number);

  // Convert to 24-hour format
  let hours24 = hours;
  if (period.toUpperCase() === 'PM' && hours !== 12) {
    hours24 += 12;
  } else if (period.toUpperCase() === 'AM' && hours === 12) {
    hours24 = 0;
  }

  // Create new Date object with today's date and parsed time
  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hours24,
    minutes,
  );
}
export function parseTimeString(timeString: string): {
  hours: number;
  minutes: number;
} {
  const match = timeString.match(/(\d+):?(\d*)?\s*(AM|PM)?/i);
  if (!match) throw new Error('Invalid time format');

  let hours = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const period = match[3]?.toUpperCase();

  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  return { hours, minutes };
}
export function formatDate(dateString: string): string {
  // Parse the input date string in DD-MM-YYYY format
  const [day, month, year] = dateString.split('-').map(Number);

  // Validate input
  if (!day || !month || !year || isNaN(day) || isNaN(month) || isNaN(year)) {
    throw new Error('Invalid date format. Expected DD-MM-YYYY');
  }

  // Create Date object (month is 0-based in JavaScript, so subtract 1)
  const date = new Date(year, month - 1, day);

  // Check if the date is valid
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date');
  }

  // Format the date using Intl.DateTimeFormat
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  })
    .format(date)
    .replace(/(\d+),/, '$1,'); // Ensure format is "MMM DD, YYYY"
}

export function formatTimeString(dateObj: Date): string {
  let hours = dateObj.getHours();
  const minutes = dateObj.getMinutes();

  // Determine AM/PM
  const period = hours >= 12 ? 'PM' : 'AM';

  // Convert to 12-hour format
  hours = hours % 12;
  hours = hours ? hours : 12; // Hour '0' should be '12'

  // Pad minutes with leading zero if needed
  const minutesStr = minutes.toString().padStart(2, '0');

  return `${hours}:${minutesStr} ${period}`;
}
export const formatDateString = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
};
/**
 * Parse date (DD-MM-YYYY) and time (h:mm a) into a timezone-agnostic Date
 * Treats values as wall-clock (local) by constructing with Date.UTC
 */

export const parseDateTime = (dateStr: string, timeStr: string): Date => {
  // Parse date: "24-10-2025" -> day=24, month=10, year=2025
  const [day, month, year] = dateStr.split('-').map(Number);

  // Parse time: "8:00 AM" -> hours=8, minutes=0, period="AM"
  const [time, period] = timeStr.trim().split(/\s+/);
  const [hoursStr, minutesStr] = time.split(':');
  let hours = Number(hoursStr);
  const minutes = Number(minutesStr);

  // Convert to 24-hour format
  if (period.toUpperCase() === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period.toUpperCase() === 'AM' && hours === 12) {
    hours = 0;
  }

  // Create Date object (month is 0-indexed in JavaScript)
  return new Date(year, month - 1, day, hours, minutes, 0, 0);
};

/**
 * Checks if two time intervals overlap
 * Interval 1: [start1, end1]
 * Interval 2: [start2, end2]
 * They overlap if: start1 < end2 AND start2 < end1
 */
export const doIntervalsOverlap = (
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date,
): boolean => {
  return start1.getTime() < end2.getTime() && start2.getTime() < end1.getTime();
};

export const checkIfNurseHasAShiftOnDateAndTime = async (
  ctx: MutationCtx,
  nurseId: Id<'nurses'>,
  startDate: string,
  endDate: string,
  startTime: string,
  endTime: string,
  facilityTimezone: string,
) => {
  // Fetch all booked shifts for the nurse
  const shifts = await ctx.db
    .query('schedules')
    .withIndex('nurse', (q) => q.eq('nurseId', nurseId).eq('status', 'booked'))
    .collect();

  // Parse the new shift's start and end datetime
  const newShiftStart = parseDateTimeWallClock(
    startDate,
    startTime,
    facilityTimezone,
  );
  const newShiftEnd = parseDateTimeWallClock(
    endDate,
    endTime,
    facilityTimezone,
  );

  // Validate that end time is after start time
  if (newShiftEnd.getTime() <= newShiftStart.getTime()) {
    throw new Error('End date/time must be after start date/time');
  }

  // Check each existing shift for conflicts
  for (const shift of shifts) {
    // Parse existing shift's start and end datetime
    const existingShiftStart = parseDateTimeWallClock(
      shift.startDate,
      shift.startTime,
      facilityTimezone,
    );
    const existingShiftEnd = parseDateTimeWallClock(
      shift.endDate,
      shift.endTime,
      facilityTimezone,
    );

    // Check if the intervals overlap
    const hasConflict = doIntervalsOverlap(
      newShiftStart,
      newShiftEnd,
      existingShiftStart,
      existingShiftEnd,
    );

    if (hasConflict) {
      throw new ConvexError({
        message: `You already has a shift from ${formatDate(shift.startDate)} ${
          shift.startTime
        } to ${formatDate(shift.endDate)} ${shift.endTime}`,
      });
    }
  }
};

type CheckNurseHasShiftType = {
  ctx: MutationCtx;
  nurseId: Id<'nurses'>;
  hospiceTimezone: string;
  shift: Doc<'schedules'>;
  isHospice: boolean;
};
export const checkIfNurseHasActiveShift = async ({
  ctx,
  nurseId,
  shift,
  hospiceTimezone,
  isHospice,
}: CheckNurseHasShiftType) => {
  const shifts = await ctx.db
    .query('schedules')
    .withIndex('nurse', (q) => q.eq('nurseId', nurseId))
    .filter((q) =>
      q.or(
        q.eq(q.field('status'), 'booked'),
        q.eq(q.field('status'), 'on_going'),
      ),
    )
    .collect();

  // Parse the new shift's start and end datetime
  const newShiftStart = parseDateTimeWallClock(
    shift.startDate,
    shift.startTime,
    hospiceTimezone,
  );
  const newShiftEnd = parseDateTimeWallClock(
    shift.endDate,
    shift.endTime,
    hospiceTimezone,
  );

  // Check each existing shift for conflicts
  for (const existing of shifts) {
    // Parse existing shift's start and end datetime
    const existingShiftStart = parseDateTimeWallClock(
      existing.startDate,
      existing.startTime,
      hospiceTimezone,
    );
    const existingShiftEnd = parseDateTimeWallClock(
      existing.endDate,
      existing.endTime,
      hospiceTimezone,
    );

    // Check if the intervals overlap
    const hasConflict = doIntervalsOverlap(
      newShiftStart,
      newShiftEnd,
      existingShiftStart,
      existingShiftEnd,
    );

    if (hasConflict) {
      const message = isHospice
        ? 'This healthcare professional already has a shift from'
        : 'You already have a shift from';
      throw new ConvexError({
        message: `${message} ${formatDate(existing.startDate)} ${
          existing.startTime
        } to ${formatDate(existing.endDate)} ${existing.endTime}`,
      });
    }
  }
};

export const checkIfNotificationHasBeenSentBeforeAndNotInteractedWith = async (
  ctx: MutationCtx,
  nurseId: Id<'nurses'>,
  scheduleId: Id<'schedules'>,
  type: 'admin' | 'assignment' | 'normal' | 'reassignment',
) => {
  const notification = await ctx.db
    .query('nurseNotifications')
    .withIndex('nurseId_scheduleId', (q) =>
      q.eq('nurseId', nurseId).eq('scheduleId', scheduleId).eq('type', type),
    )
    .filter((q) =>
      q.and(
        q.neq(q.field('status'), 'accepted'),
        q.neq(q.field('status'), 'declined'),
      ),
    )
    .first();
  return notification;
};

export const deleteAllOtherNotifications = async (
  ctx: MutationCtx,
  nurseId: Id<'nurses'>,
  hospiceNotificationId: Id<'hospiceNotifications'>,
  scheduleId: Id<'schedules'>,
  type: 'reassignment',
  hospiceId: Id<'hospices'>,
) => {
  // find hospice notifications with the same scheduleId and type
  const hospiceNotifications = await ctx.db
    .query('hospiceNotifications')
    .withIndex('hospiceId_scheduleId', (q) =>
      q
        .eq('hospiceId', hospiceId)
        .eq('scheduleId', scheduleId)
        .eq('type', type),
    )
    .filter((q) =>
      q.and(
        q.neq(q.field('_id'), hospiceNotificationId),
        q.neq(q.field('status'), 'declined'),
      ),
    )
    .collect();

  // find nurses notifications with the same scheduleId and type
  const nurseNotifications = await ctx.db
    .query('nurseNotifications')
    .withIndex('scheduleId', (q) =>
      q.eq('scheduleId', scheduleId).eq('type', type),
    )
    .filter((q) =>
      q.and(
        q.neq(q.field('nurseId'), nurseId),
        q.neq(q.field('status'), 'declined'),
      ),
    )
    .collect();

  // delete both nurses and hospice notification in batches of 500 to avoid database overload
  const size = 500;
  const deleteInBatches = async (
    notifications: Doc<'nurseNotifications'>[] | Doc<'hospiceNotifications'>[],
  ) => {
    for (let i = 0; i < notifications.length; i += size) {
      const batch = notifications.slice(i, i + size);
      await Promise.all(
        batch.map(async (n) => {
          const notification = await ctx.db.get(n._id);
          if (notification) {
            return ctx.db.delete(notification._id);
          }
        }),
      );
    }
  };
  await Promise.all([
    deleteInBatches(nurseNotifications),
    deleteInBatches(hospiceNotifications),
  ]);
};

export const sendAvailableAssignmentNotificationToNurse = async (
  ctx: MutationCtx,
  discipline: DisciplineType,
  state: string,
  hospice: Doc<'hospices'>,
  cursor: string | null,
  numItems: number,
) => {
  const data = await ctx.db
    .query('nurses')
    .withIndex('by_discipline', (q) =>
      q
        .eq('discipline', discipline)
        .eq('stateOfRegistration', state)
        .eq('status', 'approved'),
    )
    .paginate({ cursor, numItems });
  const { isDone, page, continueCursor } = data;
  for (const n of page) {
    await ctx.db.insert('nurseNotifications', {
      nurseId: n._id,
      isRead: false,
      description: `A new assignment matching your discipline has been posted by ${hospice.businessName}.`,
      title: 'New Assignment Available',
      type: 'normal',
      hospiceId: hospice._id,
      viewCount: 0,
    });
  }

  if (!isDone) {
    await sendAvailableAssignmentNotificationToNurse(
      ctx,
      discipline,
      state,
      hospice,
      continueCursor,
      numItems,
    );
  }
};

export const listNursesAndHospicesWithinLast30Days = async (ctx: QueryCtx) => {
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
  const recentNurses = await filter(
    ctx.db.query('nurses').withIndex('by_creation_time'),
    (nurse) => nurse._creationTime > thirtyDaysAgo,
  ).collect();
  const recentHospices = await filter(
    ctx.db.query('hospices').withIndex('by_creation_time'),
    (hospice) => hospice._creationTime > thirtyDaysAgo,
  ).collect();
  return {
    recentNurses,
    recentHospices,
  };
};

export const getAssignmentStatusDataHelper = async (ctx: QueryCtx) => {
  const stat = await ctx.db.query('stats').first();
  const stats = stat || {
    _creationTime: Date.now(),
    totalNurses: 0,
    totalHospices: 0,
    totalUnApprovedNurses: 0,
    totalUnApprovedHospices: 0,
    totalApprovedNurses: 0,
    totalApprovedHospices: 0,
    totalSuspendedNurses: 0,
    totalSuspendedHospices: 0,
    totalAssignments: 0,
    totalCompletedAssignments: 0,
    totalEndedAssignments: 0,
    totalActiveAssignments: 0,
    totalRejectedNurses: 0,
    totalRejectedHospices: 0,
  };

  return stats;
};

export const getUserHelperFn = async (ctx: QueryCtx | MutationCtx) => {
  return authComponent.safeGetAuthUser(ctx);
};
export const getUserById = async (
  ctx: QueryCtx | MutationCtx,
  userId: BetterAuthId<'user'>,
) => {
  return ctx.runQuery(components.betterAuth.users.getUser, {
    userId,
  });
};
export const checkDurationOfNotSubmittedAssignment = (
  numberOfDays: number,
  nurseAssignment: Doc<'nurseAssignments'>,
  maxNumberOfDays?: number,
) => {
  const now = Date.now();
  const DAY_MS = 24 * 60 * 60 * 1000;
  const minMs = numberOfDays * DAY_MS;

  const completedAt = nurseAssignment.completedAt;
  if (typeof completedAt !== 'number' || completedAt <= 0) {
    return false;
  }
  const timeSinceCompletion = now - completedAt;

  // Future dates shouldn't count (just in case)
  if (timeSinceCompletion < 0) return false;

  const hasReachedMinDay = timeSinceCompletion >= minMs;
  // If maxNumberOfDays is provided, enforce an upper bound so the window
  // covers only exactly that day (e.g. day 5 only, not day 5+6+7)
  const hasNotReachedMaxDay =
    maxNumberOfDays === undefined
      ? true
      : timeSinceCompletion < maxNumberOfDays * DAY_MS;

  return (
    nurseAssignment.isCompleted &&
    !nurseAssignment.isSubmitted &&
    hasReachedMinDay &&
    hasNotReachedMaxDay
  );
};

export const getUserFromBetterAuthId = async (
  ctx: QueryCtx | MutationCtx,
  userId: BetterAuthId<'user'>,
) => {
  return await ctx.db
    .query('users')
    .withIndex('userId', (q) => q.eq('userId', userId))
    .first();
};

type DisableAllOtherNotificationsForThisScheduleType = {
  ctx: MutationCtx;
  scheduleId: Id<'schedules'>;
  type: 'assignment' | 'reassignment';
  nurseNotificationId?: Id<'nurseNotifications'>;
  hospiceNotificationId?: Id<'hospiceNotifications'>;
  cursor: null | string;
  numItems: number;
};
type DisableAllOtherHospiceNotificationsForThisScheduleType = {
  ctx: MutationCtx;
  scheduleId: Id<'schedules'>;

  nurseNotificationId?: Id<'nurseNotifications'>;
  hospiceNotificationId?: Id<'hospiceNotifications'>;
  cursor: null | string;
  numItems: number;
};

export const deleteAllOtherNotificationsForThisSchedule = async ({
  ctx,
  scheduleId,
  type,
  nurseNotificationId,
  cursor,
  numItems,
}: DisableAllOtherNotificationsForThisScheduleType) => {
  const notifications = await ctx.db
    .query('nurseNotifications')
    .withIndex('scheduleId', (q) =>
      q.eq('scheduleId', scheduleId).eq('type', type),
    )
    .filter((q) => q.neq(q.field('_id'), nurseNotificationId))
    .paginate({ cursor, numItems });

  const { isDone, page, continueCursor } = notifications;
  for (const notification of page) {
    await ctx.db.delete('nurseNotifications', notification._id);
  }
  if (!isDone) {
    await deleteAllOtherNotificationsForThisSchedule({
      ctx,
      scheduleId,
      type,
      nurseNotificationId,
      cursor: continueCursor,
      numItems,
    });
  }
};
export const deleteAllOtherHospiceNotificationsForThisSchedule = async ({
  ctx,
  scheduleId,
  hospiceNotificationId,
  cursor,
  numItems,
}: DisableAllOtherHospiceNotificationsForThisScheduleType) => {
  const notifications = await ctx.db
    .query('hospiceNotifications')
    .withIndex('scheduleId', (q) =>
      q.eq('scheduleId', scheduleId).eq('type', 'case_request'),
    )
    .filter((q) => q.neq(q.field('_id'), hospiceNotificationId))
    .paginate({ cursor, numItems });

  const { isDone, page, continueCursor } = notifications;
  for (const notification of page) {
    await ctx.db.delete('hospiceNotifications', notification._id);
  }
  if (!isDone) {
    await deleteAllOtherHospiceNotificationsForThisSchedule({
      ctx,
      scheduleId,
      hospiceNotificationId,
      cursor: continueCursor,
      numItems,
    });
  }
};
