import { ConvexError, Infer } from 'convex/values';
import { Doc, Id } from './_generated/dataModel';
import { mutation, MutationCtx, QueryCtx } from './_generated/server';
import { parseDateTimeWallClock } from './actionHelper';
import { day } from './schema';

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
  day: string
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
  rate: number = 50
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
    minutes
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
  end2: Date
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
  facilityTimezone: string
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
    facilityTimezone
  );
  const newShiftEnd = parseDateTimeWallClock(
    endDate,
    endTime,
    facilityTimezone
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
      facilityTimezone
    );
    const existingShiftEnd = parseDateTimeWallClock(
      shift.endDate,
      shift.endTime,
      facilityTimezone
    );

    // Check if the intervals overlap
    const hasConflict = doIntervalsOverlap(
      newShiftStart,
      newShiftEnd,
      existingShiftStart,
      existingShiftEnd
    );

    if (hasConflict) {
      throw new ConvexError({
        message: `You already has a shift from ${formatDate(shift.startDate)} ${shift.startTime} to ${formatDate(shift.endDate)} ${shift.endTime}`,
      });
    }
  }
};

type CheckNurseHasShiftType = {
  ctx: MutationCtx;
  nurseId: Id<'nurses'>;
  hospiceTimezone: string;
  shift: Doc<'schedules'>;
};
export const checkIfNurseHasActiveShift = async ({
  ctx,
  nurseId,
  shift,
  hospiceTimezone,
}: CheckNurseHasShiftType) => {
  console.log({ nurseId });

  const shifts = await ctx.db
    .query('schedules')
    .withIndex('nurse', (q) => q.eq('nurseId', nurseId))
    .filter((q) =>
      q.or(
        q.eq(q.field('status'), 'booked'),
        q.eq(q.field('status'), 'on_going')
      )
    )
    .collect();

  // Parse the new shift's start and end datetime
  const newShiftStart = parseDateTimeWallClock(
    shift.startDate,
    shift.startTime,
    hospiceTimezone
  );
  const newShiftEnd = parseDateTimeWallClock(
    shift.endDate,
    shift.endTime,
    hospiceTimezone
  );

  // Check each existing shift for conflicts
  for (const existing of shifts) {
    // Parse existing shift's start and end datetime
    const existingShiftStart = parseDateTimeWallClock(
      existing.startDate,
      existing.startTime,
      hospiceTimezone
    );
    const existingShiftEnd = parseDateTimeWallClock(
      existing.endDate,
      existing.endTime,
      hospiceTimezone
    );

    // Check if the intervals overlap
    const hasConflict = doIntervalsOverlap(
      newShiftStart,
      newShiftEnd,
      existingShiftStart,
      existingShiftEnd
    );

    if (hasConflict) {
      throw new ConvexError({
        message: `You already have a shift from ${formatDate(
          existing.startDate
        )} ${existing.startTime} to ${formatDate(existing.endDate)} ${
          existing.endTime
        }`,
      });
    }
  }
};

export const checkIfNotificationHasBeenSentBeforeAndNotInteractedWith = async (
  ctx: MutationCtx,
  nurseId: Id<'nurses'>,
  scheduleId: Id<'schedules'>,
  type: 'admin' | 'assignment' | 'normal' | 'reassignment'
) => {
  const notification = await ctx.db
    .query('nurseNotifications')
    .withIndex('nurseId_scheduleId', (q) =>
      q.eq('nurseId', nurseId).eq('scheduleId', scheduleId).eq('type', type)
    )
    .filter((q) =>
      q.and(
        q.neq(q.field('status'), 'accepted'),
        q.neq(q.field('status'), 'declined')
      )
    )
    .first();
  return notification;
};
