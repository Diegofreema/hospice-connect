/* eslint-disable @typescript-eslint/no-empty-object-type */
import { Doc, Id } from '@/convex/_generated/dataModel';
import { scheduleStatus } from '@/convex/schema';
import { ReactMutation } from 'convex/react';
import { FunctionReference } from 'convex/server';
import { ConvexError, Infer } from 'convex/values';
import {
  addHours,
  differenceInHours,
  format,
  setHours,
  setMinutes,
} from 'date-fns';
import { Dimensions } from 'react-native';
const { width } = Dimensions.get('window');

// Device type detection
const isTablet = width >= 768;
const isLargePhone = width >= 414;
const isSmallPhone = width <= 320;

export const getFontSize = (baseSize: number) => {
  if (isTablet) {
    return baseSize * 1.3;
  } else if (isLargePhone) {
    return baseSize * 1.1;
  } else if (isSmallPhone) {
    return baseSize * 0.9;
  }
  return baseSize;
};

export const generateErrorMessage = (
  error: unknown,
  message: string
): string => {
  return error instanceof ConvexError
    ? // Access data and cast it to the type we expect
      (error.data as { message: string }).message
    : message;
};

export function validateFields(fieldsToValidate: string[], values: any) {
  // Check each field in the fieldsToValidate array
  for (const field of fieldsToValidate) {
    // Check if field exists in values and if it's empty
    if (
      !values[field] ||
      values[field] === '' ||
      values[field] === null ||
      values[field] === undefined
    ) {
      return false; // Return false if any field is empty
    }
  }
  return true; // Return true if all fields have values
}

export const uploadProfilePicture = async (
  generateUploadUrl: ReactMutation<
    FunctionReference<'mutation', 'public', {}, string, string | undefined>
  >,
  selectedImage?: string
): Promise<{ storageId: Id<'_storage'>; uploadUrl: string } | undefined> => {
  try {
    if (!selectedImage) return;
    const uploadUrl = await generateUploadUrl();

    const response = await fetch(selectedImage);
    const blob = await response.blob();

    const result = await fetch(uploadUrl, {
      method: 'POST',
      body: blob,
      headers: { 'Content-Type': 'image/jpeg' },
    });
    const { storageId } = await result.json();

    return { storageId, uploadUrl };
  } catch (error) {
    console.log({ error });
  }
};

export const changeFirstLetterToCapital = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const trimText = (text: string, maxLength: number) => {
  if (text.length > maxLength) {
    return text.substring(0, maxLength - 3) + '...';
  }
  return text;
};

export const getScheduleStatusText = (status: Infer<typeof scheduleStatus>) => {
  switch (status) {
    case 'available':
      return 'Available';
    case 'booked':
      return 'Booked';
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    default:
      return 'Not Covered';
  }
};
export const getAssignmentStatusText = (
  status: Infer<typeof scheduleStatus>
) => {
  switch (status) {
    case 'available':
      return 'Staff needed';
    case 'booked':
      return 'Fully staffed';
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    default:
      return 'Not Covered';
  }
};

export const getScheduleStatusAndColor = (
  status: Infer<typeof scheduleStatus>
) => {
  switch (status) {
    case 'completed':
      return {
        status: 'success',
        color: '#00A25C',
      };
    case 'booked':
      return { status: 'pending', color: '#9747FF' };

    case 'not_covered':
      return { status: 'error', color: '#991B1B' };
    case 'cancelled':
      return { status: 'error', color: '#991B1B' };
    default:
      return { status: 'warning', color: '#FFBF00' };
  }
};

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

function timeToHours(timeStr: string) {
  const [time, period] = timeStr.split(/\s+/);
  let [hours, minutes] = time.split(':').map(Number);

  if (period === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }

  return hours + minutes / 60;
}

// Function to calculate hours for a single shift
function calculateShiftHours(shift: Doc<'schedules'>) {
  let startHours = timeToHours(shift.startTime);
  let endHours = timeToHours(shift.endTime);

  // Handle overnight shifts (end time is before start time)
  if (endHours < startHours) {
    endHours += 24;
  }

  return endHours - startHours;
}

// Calculate total hours worked
export function calculateTotalHours(shifts: Doc<'schedules'>[]) {
  let totalHours = 0;

  shifts.forEach((shift) => {
    const hours = calculateShiftHours(shift);
    console.log(
      `Shift ${shift.startTime} - ${shift.endTime}: ${hours.toFixed(2)} hours`
    );
    totalHours += hours;
  });

  return totalHours;
}

interface Shift {
  start: string;
  end: string;
  startShift: string;
  endShift: string;
}

interface ShiftData {
  startDate: Date;
  endDate: Date;
  openShift: string;
}

/**
 * Generates an array of 12-hour shifts between startDate and endDate.
 * @param data - Object containing startDate and endDate.
 * @param includePartial - Whether to include a partial shift at the end (default: false).
 * @returns Array of shift objects with formatted dates and times.
 */
export function generateShifts(
  data: ShiftData,
  includePartial: boolean = false
): Shift[] {
  // Validate input dates
  if (!(data.startDate instanceof Date) || isNaN(data.startDate.getTime())) {
    throw new ConvexError({ message: 'Invalid startDate' });
  }
  if (!(data.endDate instanceof Date) || isNaN(data.endDate.getTime())) {
    console.log('startDate must be before endDate');

    throw new ConvexError({ message: 'Invalid endDate' });
  }
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);
  console.log({ startDate, endDate });

  console.log(startDate.getTime() >= endDate.getTime());

  if (startDate.getTime() > endDate.getTime()) {
    console.log('startDate must be before endDate');
    throw new ConvexError({ message: 'start date must be before end date' });
  }

  // Validate and parse openShift time (expecting "HH:mm" format)
  const timeMatch = data.openShift.match(/^(\d{1,2}):(\d{2})$/);
  if (!timeMatch) {
    console.log('Invalid openShift time format. Use HH:mm (e.g., "07:00").');

    throw new ConvexError({
      message: 'Invalid openShift time format. Use HH:mm (e.g., "07:00").',
    });
  }
  const [_, hours, minutes] = timeMatch;
  const openShiftHours = parseInt(hours, 10);
  const openShiftMinutes = parseInt(minutes, 10);
  if (openShiftHours > 23 || openShiftMinutes > 59) {
    throw new ConvexError({ message: 'Invalid open shift time.' });
  }

  // Set the first shift's start time to openShift time on startDate
  const firstShiftStart = setHours(
    setMinutes(data.startDate, openShiftMinutes),
    openShiftHours
  );

  // Calculate number of 12-hour shifts
  const hoursDifference = differenceInHours(data.endDate, firstShiftStart);
  const numberOfShifts = includePartial
    ? Math.ceil(hoursDifference / 12)
    : Math.floor(hoursDifference / 12);

  const shifts: Shift[] = [];

  for (let index = 0; index < numberOfShifts; index++) {
    // Calculate shift start by adding 12 hours per index from firstShiftStart
    const shiftStart = addHours(firstShiftStart, index * 12);

    // Calculate shift end (12 hours after start or capped at endDate)
    const shiftEnd = addHours(shiftStart, 12);
    if (shiftEnd > data.endDate && !includePartial) {
      break; // Skip partial shift if not included
    }

    // Cap shift end at endDate
    const cappedShiftEnd = shiftEnd > data.endDate ? data.endDate : shiftEnd;

    // Format dates as dd-MM-yyyy
    const start = format(shiftStart, 'dd-MM-yyyy');
    const end = format(cappedShiftEnd, 'dd-MM-yyyy');

    // Format times as h:mm AM/PM
    const startShift = shiftStart.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    const endShift = cappedShiftEnd.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    shifts.push({
      start,
      end,
      startShift,
      endShift,
    });
  }

  return shifts;
}

export const fullName = (firstName?: string, lastName?: string) => {
  if (!firstName && !lastName) return '';

  return `${firstName} ${lastName}`;
};

type ShiftWithDateFns = {
  startDate: Date;
  endDate: Date;
  openShift: Date;
};

export const generateShiftsWithDateFns = ({
  endDate,
  openShift,
  startDate,
}: ShiftWithDateFns): Shift[] => {
  const distanceBetweenDates = differenceInHours(endDate, startDate);
  //check if start time and opening shift has passed
  const shiftTimeHasStarted =
    startDate.setHours(openShift.getHours(), openShift.getMinutes(), 0, 0) <=
    Date.now();
  if (shiftTimeHasStarted) {
    throw new ConvexError({
      message: 'Shift time has already started',
    });
  }

  const shifts: Shift[] = [];
  if (distanceBetweenDates < 1) {
    const endShift = addHours(openShift, 12);
    const shift = {
      start: format(startDate, 'dd-MM-yyyy'),
      end: format(endDate, 'dd-MM-yyyy'),
      startShift: format(openShift, 'h:mm a'),
      endShift: format(endShift, 'h:mm a'),
    };
    shifts.push(shift);
  } else {
    // a shift is 12 hours per day ,
    const totalShifts = Math.ceil(distanceBetweenDates / 12);

    for (let i = 0; i < totalShifts; i++) {
      const shiftStart = addHours(startDate, i * 12);
      const shiftEnd = addHours(shiftStart, 12);

      // Ensure the last shift doesn't exceed the end date
      const actualShiftEnd = shiftEnd > endDate ? endDate : shiftEnd;

      const shiftStartTime = addHours(openShift, i * 12);
      const shiftEndTime = addHours(shiftStartTime, 12);

      const shift = {
        start: format(shiftStart, 'dd-MM-yyyy'),
        end: format(actualShiftEnd, 'dd-MM-yyyy'),
        startShift: format(shiftStartTime, 'h:mm a'),
        endShift: format(shiftEndTime, 'h:mm a'),
      };

      shifts.push(shift);
    }
  }

  return shifts;
};
