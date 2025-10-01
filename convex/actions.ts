import { v } from 'convex/values';
import { action } from './_generated/server';

// Define the Shift type
interface Shift {
  status: string;

  startTime: string;
  endTime: string;
  startDate: string;
  endDate: string;
}

// args type

function parseDateTime(dateStr: string, timeStr: string): Date {
  const [hours, minutes] = timeStr
    .replace(/\s*(AM|PM)/i, '')
    .split(':')
    .map(Number);
  const isPM = timeStr.toUpperCase().includes('PM');
  const adjustedHours =
    isPM && hours !== 12 ? hours + 12 : !isPM && hours === 12 ? 0 : hours;
  const date = new Date(`${dateStr}T00:00:00.000Z`);
  date.setUTCHours(adjustedHours - 1, minutes, 0, 0); // Adjust for WAT (UTC+1)
  return date;
}
type Args = {
  startDate: string;
  endDate: string;
  openShift: string;
};
// Function to generate 12-hour shifts in WAT
export const generateShifts = (args: Args) => {
  const shifts: Shift[] = [];
  const start = parseDateTime(args.startDate, args.openShift);
  const end = parseDateTime(args.endDate, '11:59:59.999 PM');

  // Validate argss
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error('Invalid start or end date/time');
  }
  if (start > end) {
    throw new Error('Start date/time must be before end date/time');
  }

  let current = new Date(start);

  while (current <= end) {
    // Calculate shift end time (12 hours later)
    const shiftEnd = new Date(current.getTime() + 12 * 60 * 60 * 1000);

    // If shift end exceeds end date, adjust to end date
    const effectiveEnd = shiftEnd <= end ? shiftEnd : end;

    // Format dates and times
    const startTime = current.toISOString();
    const endTime = effectiveEnd.toISOString();
    const startDateStr = startTime.split('T')[0];
    const endDateStr = endTime.split('T')[0];

    shifts.push({
      status: 'available',

      startTime,
      endTime,
      startDate: startDateStr,
      endDate: endDateStr,
    });

    // Move to next shift (12 hours later)
    current = new Date(current.getTime() + 12 * 60 * 60 * 1000);

    // Align to openShift time on next day if crossing midnight
    const currentHours = current.getUTCHours() + 1; // Adjust for WAT
    const startHours = start.getUTCHours() + 1;
    const currentMinutes = current.getUTCMinutes();
    const startMinutes = start.getUTCMinutes();
    if (currentHours !== startHours || currentMinutes !== startMinutes) {
      const nextDay = new Date(current);
      nextDay.setUTCDate(nextDay.getUTCDate() + 1);
      current = parseDateTime(
        nextDay.toISOString().split('T')[0],
        args.openShift
      );
    }

    // Break if next shift starts after end date
    if (current > end) break;
  }

  return shifts;

  // Example usage
};

export const createShifts = action({
  args: {
    startDate: v.string(),
    endDate: v.string(),
    openShift: v.string(),
    assignmentId: v.id('assignments'),
  },
  handler: async (ctx, args) => {},
});
