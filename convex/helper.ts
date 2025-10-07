import { Infer } from 'convex/values';
import { Id } from './_generated/dataModel';
import { mutation, QueryCtx } from './_generated/server';
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
  return ratings.reduce((acc, rating) => acc + rating.rate, 0);
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
export function stringToDate(dateString: string): Date | null {
  // Validate format with regex: DD-MM-YYYY
  const dateRegex = /^(\d{2})-(\d{2})-(\d{4})$/;
  if (!dateRegex.test(dateString)) {
    console.warn(`Invalid date format: "${dateString}". Expected DD-MM-YYYY.`);
    return null;
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
    return null;
  }

  return date;
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
