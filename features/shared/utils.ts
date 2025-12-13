/* eslint-disable @typescript-eslint/no-empty-object-type */
import { Doc, Id } from '@/convex/_generated/dataModel';
import { scheduleStatus } from '@/convex/schema';
import { ReactMutation } from 'convex/react';
import { FunctionReference } from 'convex/server';
import { ConvexError, Infer } from 'convex/values';
import { addHours, differenceInYears, format, parse, set } from 'date-fns';
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
    ? error.data?.message || message
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
    case 'on_going':
      return 'Ongoing';
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    case 'ended':
      return 'Ended';
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
    case 'ended':
      return 'Ended';
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
    case 'on_going':
      return { status: 'ongoing', color: '#4C55FF' };
    case 'not_covered':
      return { status: 'error', color: '#991B1B' };
    case 'cancelled':
      return { status: 'error', color: '#991B1B' };
    case 'ended':
      return { status: 'error', color: '#991B1B' };
    default:
      return { status: 'warning', color: '#FFBF00' };
  }
};

export function convertTimeStringToDate(timeString: string, value?: string) {
  // Get current date to use as base
  if (!timeString) return new Date();
  const now = new Date();

  // Parse the time string (e.g., "3:59 AM")
  const [time, period] = timeString.split(/\s+/);
  const [hours, minutes] = time.split(':').map(Number);

  // Convert to 24-hour format
  let hours24 = hours;
  if (period?.toUpperCase() === 'PM' && hours !== 12) {
    hours24 += 12;
  } else if (period?.toUpperCase() === 'AM' && hours === 12) {
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
export function convertTimeStringToDate2(timeString: string, value?: string) {
  // Get current date to use as base
  if (!timeString) return { hours: 0, minutes: 0 };

  // Parse the time string (e.g., "3:59 AM")
  const [time, period] = timeString.split(/\s+/);
  const [hours, minutes] = time.split(':').map(Number);

  // Convert to 24-hour format
  let hours24 = hours;
  if (period?.toUpperCase() === 'PM' && hours !== 12) {
    hours24 += 12;
  } else if (period?.toUpperCase() === 'AM' && hours === 12) {
    hours24 = 0;
  }

  // Create new Date object with today's date and parsed time

  return { hours: hours24, minutes: minutes };
}

// Function to calculate hours for a single shift

// Calculate total hours worked
export function calculateTotalHours(shifts: Doc<'schedules'>[]) {
  let totalHours = 0;

  for (const shift of shifts) {
    const startDateObj = parse(shift.startDate, 'dd-MM-yyyy', new Date());
    const startParts = convertTimeStringToDate2(shift.startTime);
    startDateObj.setHours(startParts.hours, startParts.minutes, 0, 0);

    if (shift.isTimeEdited) {
      const endDateObj = parse(shift.endDate, 'dd-MM-yyyy', new Date());
      const endParts = convertTimeStringToDate2(shift.endTime);
      endDateObj.setHours(endParts.hours, endParts.minutes, 0, 0);
      let hours = (endDateObj.getTime() - startDateObj.getTime()) / 3600000;
      if (hours < 0) {
        hours += 24;
      }
      totalHours += hours;
      continue;
    }

    if (shift.canceledAt) {
      const canceledDate = new Date(shift.canceledAt);
      if (canceledDate.getTime() <= startDateObj.getTime()) {
        continue;
      }
      const diff = (canceledDate.getTime() - startDateObj.getTime()) / 3600000;
      totalHours += diff < 0 ? 0 : diff;
      continue;
    }
    if (shift.reassignedAt) {
      const reassignedDate = new Date(shift.reassignedAt);
      if (reassignedDate.getTime() <= startDateObj.getTime()) {
        continue;
      }
      const diff =
        (reassignedDate.getTime() - startDateObj.getTime()) / 3600000;
      totalHours += diff < 0 ? 0 : diff;
      continue;
    }

    const endDateObj = parse(shift.endDate, 'dd-MM-yyyy', new Date());
    const endParts = convertTimeStringToDate2(shift.endTime);
    endDateObj.setHours(endParts.hours, endParts.minutes, 0, 0);

    let hours = (endDateObj.getTime() - startDateObj.getTime()) / 3600000;
    if (hours < 0) {
      hours += 24;
    }
    totalHours += hours;
  }

  return totalHours;
}

interface Shift {
  start: string;
  end: string;
  startShift: string;
  endShift: string;
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
  const shifts: Shift[] = [];
  let cursor = set(startDate, {
    hours: openShift.getHours(),
    minutes: openShift.getMinutes(),
    seconds: 0,
    milliseconds: 0,
  });

  while (cursor < endDate) {
    const shiftEnd = addHours(cursor, 12);

    shifts.push({
      start: format(cursor, 'dd-MM-yyyy'),
      end: format(shiftEnd, 'dd-MM-yyyy'),
      startShift: format(cursor, 'h:mm a'),
      endShift: format(shiftEnd, 'h:mm a'),
    });

    cursor = shiftEnd;
  }

  return shifts;
};

export const calculateAge = (dob: Date): number => {
  const today = new Date();
  return differenceInYears(today, dob);
};

export const sortedArray = <T extends { _creationTime: number }>(
  array: T[]
): T[] => {
  return [...array].sort((a, b) => {
    const dateA = new Date(a._creationTime);
    const dateB = new Date(b._creationTime);
    return dateB.getTime() - dateA.getTime();
  });
};
export const sortedArrayByAvailability = <
  T extends { available?: { available: boolean } },
>(
  array: T[]
): T[] => {
  return [...array].sort(
    (a, b) => +!!b.available?.available - +!!a.available?.available
  );
};

export const reverseDateString = (dateString: string) => {
  const [year, month, day] = dateString.split('-');
  return `${day}-${month}-${year}`;
};
export const reverseDateStringToMDY = (dateString: string) => {
  const [day, month, year] = dateString.split('-');
  return `${month}-${day}-${year}`;
};

export type Reaction = {
  type: 'like' | 'love' | 'haha' | 'sad' | 'wow';
};

export const renderReaction = (
  reaction?: Reaction,
  userId?: string,
  reactUserId?: string,
  reactUserName?: string
) => {
  const isMyReaction = userId === reactUserId;
  if (!reaction) return '';

  if (reaction.type === 'like') {
    return `${isMyReaction ? 'You reacted 👍 to ' : `${reactUserName} reacted 👍 to `}`;
  }
  if (reaction.type === 'love') {
    return `${isMyReaction ? 'You reacted ❤️ to ' : `${reactUserName} reacted ❤️ to `}`;
  }
  if (reaction.type === 'haha') {
    return `${isMyReaction ? 'You reacted 😂 to ' : `${reactUserName} reacted 😂 to `}`;
  }
  if (reaction.type === 'sad') {
    return `${isMyReaction ? 'You reacted 😢 to ' : `${reactUserName} reacted 😢 to `}`;
  }
  if (reaction.type === 'wow') {
    return `${isMyReaction ? 'You reacted 😲 to ' : `${reactUserName} reacted 😲 to `}`;
  }
  return '';
};

export const timezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

export const formatPhoneNumber = (phoneNumber: string | number): string => {
  const cleaned = String(phoneNumber).replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);

  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }

  return String(phoneNumber);
};
