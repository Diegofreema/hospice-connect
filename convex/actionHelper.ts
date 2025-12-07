'use node';

import { toZonedTime } from 'date-fns-tz';
export const parseDateTimeWallClock = (
  dateStr: string, // "25-12-2025"
  timeStr: string, // "11:30 PM" or "09:15 AM"
  facilityTimezone: string // e.g. "America/New_York", "Asia/Tokyo", "Europe/London"
): Date => {
  // Step 1: Build a naive date object from the input
  const [day, month, year] = dateStr.split('-').map(Number);

  // Step 2: Parse the 12-hour time with AM/PM
  const timeMatch = timeStr.trim().match(/^(\d{1,2}):?(\d{2})?\s*(AM|PM)$/i);
  if (!timeMatch) {
    throw new Error(
      `Invalid time format: ${timeStr}. Expected e.g. "9:30 PM" or "11:00 AM"`
    );
  }

  let hours = parseInt(timeMatch[1], 10);
  const minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
  const period = timeMatch[3].toUpperCase();

  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  // Step 3: Create a Date in the facility's time zone
  const naiveDate = new Date(year, month - 1, day, hours, minutes, 0, 0);

  // Step 4: Interpret it correctly in the facility's zone and convert to UTC
  const zonedDate = toZonedTime(naiveDate, facilityTimezone);

  return zonedDate; // ← This is your single source of truth (UTC ms)
};
