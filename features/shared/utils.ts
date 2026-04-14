/* eslint-disable @typescript-eslint/no-empty-object-type */
import { api } from '@/convex/_generated/api';
import { type Doc, type Id } from '@/convex/_generated/dataModel';
import { discipline, type scheduleStatus } from '@/convex/schema';

import { type ReactMutation } from 'convex/react';
import { FunctionReturnType, type FunctionReference } from 'convex/server';
import { ConvexError, type Infer } from 'convex/values';
import {
  addHours,
  addMinutes,
  differenceInYears,
  endOfDay,
  format,
  isSameDay,
  parse,
  set,
  subHours,
} from 'date-fns';
import { getTimezoneOffset, toZonedTime } from 'date-fns-tz';
import { Dimensions } from 'react-native';
import Purchases from 'react-native-purchases';

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
  message: string,
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
  selectedImage?: string,
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
  status: Infer<typeof scheduleStatus>,
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
export const getColorsForDiscipline = (value: Infer<typeof discipline>) => {
  switch (value) {
    case 'RN':
      return 'text-orange-500 bg-orange-100';
    case 'LVN':
      return 'text-blue-500 bg-blue-100';
    case 'HHA':
      return 'text-yellow-500 bg-yellow-100';

    default:
      return 'text-gray-500 bg-gray-100';
  }
};
export const getScheduleStatusAndColor = (
  status: Infer<typeof scheduleStatus>,
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
    minutes,
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

    // ── Time was edited → always use startTime to endTime ─────────────────
    if (shift.isTimeEdited || shift.isEdited) {
      // If cancelled before the shift start → 0 hrs
      if (shift.canceledAt) {
        const canceledDate = new Date(shift.canceledAt);
        if (canceledDate.getTime() <= startDateObj.getTime()) {
          continue;
        }
      }

      const endDateObj = parse(shift.endDate, 'dd-MM-yyyy', new Date());
      const endParts = convertTimeStringToDate2(shift.endTime);
      endDateObj.setHours(endParts.hours, endParts.minutes, 0, 0);
      let hours = (endDateObj.getTime() - startDateObj.getTime()) / 3600000;
      if (hours < 0) hours += 24;
      totalHours += hours;
      continue;
    }

    // ── Cancelled (not edited) ───────────────────────────────────────────────
    if (shift.canceledAt) {
      const canceledDate = new Date(shift.canceledAt);

      // If also reassigned and cancellation happened before (or at) reassignment → 0 hrs
      if (shift.reassignedAt) {
        const reassignedDate = new Date(shift.reassignedAt);
        if (canceledDate.getTime() <= reassignedDate.getTime()) {
          continue;
        }
      }

      // Cancelled at or before shift start → 0 hrs
      if (canceledDate.getTime() <= startDateObj.getTime()) {
        continue;
      }

      // Cancelled after start → hours from start to cancellation
      const diff = (canceledDate.getTime() - startDateObj.getTime()) / 3600000;
      totalHours += diff;
      continue;
    }

    // ── Reassigned (not edited) ──────────────────────────────────────────────
    if (shift.reassignedAt) {
      const reassignedDate = new Date(shift.reassignedAt);
      const endDateObj = parse(shift.endDate, 'dd-MM-yyyy', new Date());
      const endParts = convertTimeStringToDate2(shift.endTime);
      endDateObj.setHours(endParts.hours, endParts.minutes, 0, 0);

      // Reassigned after end → 0 hrs
      if (reassignedDate.getTime() >= endDateObj.getTime()) {
        continue;
      }

      let diff = (endDateObj.getTime() - reassignedDate.getTime()) / 3600000;
      if (diff < 0) diff += 24;
      totalHours += diff;
      continue;
    }

    // ── Default (normal shift) ────────────────────────────────────────────────
    const endDateObj = parse(shift.endDate, 'dd-MM-yyyy', new Date());
    const endParts = convertTimeStringToDate2(shift.endTime);
    endDateObj.setHours(endParts.hours, endParts.minutes, 0, 0);
    let hours = (endDateObj.getTime() - startDateObj.getTime()) / 3600000;
    if (hours < 0) hours += 24;
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

  // Set cursor to the desired start time on startDate
  let cursor = set(startDate, {
    hours: openShift.getHours(),
    minutes: openShift.getMinutes(),
    seconds: 0,
    milliseconds: 0,
  });

  // Special case: same day → only one shift, ending at end of day
  if (isSameDay(startDate, endDate)) {
    const shiftEnd = addMinutes(endOfDay(cursor), 1);

    shifts.push({
      start: format(cursor, 'dd-MM-yyyy'),
      end: format(shiftEnd, 'dd-MM-yyyy'),
      startShift: format(cursor, 'h:mm a'),
      endShift: format(shiftEnd, 'h:mm a'), // will be "11:59 PM"
    });

    return shifts;
  }

  // Multi-day case: generate full 12-hour shifts until we can't anymore
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
  array: T[],
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
  array: T[],
): T[] => {
  return [...array].sort(
    (a, b) => +!!b.available?.available - +!!a.available?.available,
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

export const reverseDateStringToMDYShort = (dateString: string) => {
  const [day, month, year] = dateString.split('-');
  return `${month}-${day}-${year.slice(-2)}`;
};

export type Reaction = {
  type: 'like' | 'love' | 'haha' | 'sad' | 'wow';
};

export const renderReaction = (
  reaction?: Reaction,
  userId?: string,
  reactUserId?: string,
  reactUserName?: string,
) => {
  const isMyReaction = userId === reactUserId;
  if (!reaction) return '';

  if (reaction.type === 'like') {
    return `${
      isMyReaction ? 'You reacted 👍 to ' : `${reactUserName} reacted 👍 to `
    }`;
  }
  if (reaction.type === 'love') {
    return `${
      isMyReaction ? 'You reacted ❤️ to ' : `${reactUserName} reacted ❤️ to `
    }`;
  }
  if (reaction.type === 'haha') {
    return `${
      isMyReaction ? 'You reacted 😂 to ' : `${reactUserName} reacted 😂 to `
    }`;
  }
  if (reaction.type === 'sad') {
    return `${
      isMyReaction ? 'You reacted 😢 to ' : `${reactUserName} reacted 😢 to `
    }`;
  }
  if (reaction.type === 'wow') {
    return `${
      isMyReaction ? 'You reacted 😲 to ' : `${reactUserName} reacted 😲 to `
    }`;
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

export const convertNumberToStringThenToNumber = (num: number) =>
  Number(num.toFixed(2));

export const timeIsBeforeOrSameTime = (time1: number, time2: number) =>
  time1 <= time2;

export const abbreviateCareLevel = (
  careLevel:
    | 'Initial Evaluation'
    | 'Follow Up'
    | 'Continuous Care'
    | 'Supervision'
    | 'Recertification'
    | 'Discharge',
) => {
  let abbr = '';

  switch (careLevel) {
    case 'Initial Evaluation':
      abbr = 'Initial Eval';
      break;
    case 'Follow Up':
      abbr = 'Follow Up';
      break;
    case 'Continuous Care':
      abbr = 'Cont. Care';
      break;
    case 'Supervision':
      abbr = 'Supervision';
      break;
    case 'Recertification':
      abbr = 'Recert.';
      break;
    case 'Discharge':
      abbr = 'Discharge';
      break;
  }

  return abbr;
};

export const getPasswordStrength = (password: string) => {
  if (!password) return { strength: 0, label: '', color: 'transparent' };

  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-blue-500',
    'bg-green-500',
  ];

  return {
    strength,
    label: labels[strength - 1] || '',
    color: colors[strength - 1] || '',
  };
};

export const calculateTotalEarnings = (shifts: Doc<'schedules'>[]) => {
  return shifts.reduce(
    (acc, shift) =>
      acc +
      convertNumberToStringThenToNumber(calculateTotalHours([shift])) *
        shift.rate,
    0,
  );
};

export const setRCAttributes = async (hospiceName: string) => {
  await Purchases.setAttributes({
    $displayName: hospiceName,
  });
};
export function getTimezoneDifference(
  tz1: string,
  tz2: string,
  date: Date = new Date(),
): TimezoneDifferenceResult {
  const offset1Ms = getTimezoneOffset(tz1, date);
  const offset2Ms = getTimezoneOffset(tz2, date);

  const offset1 = offset1Ms / (1000 * 60 * 60); // hours
  const offset2 = offset2Ms / (1000 * 60 * 60);
  const difference = offset2 - offset1; // positive = tz2 is ahead

  const zonedTime1 = toZonedTime(date, tz1);
  const zonedTime2 = toZonedTime(date, tz2);

  const tz2IsAhead = difference > 0;
  const tz2IsBehind = difference < 0;

  return {
    timezone1: tz1,
    timezone2: tz2,
    time1: format(zonedTime1, 'yyyy-MM-dd HH:mm:ss'),
    time2: format(zonedTime2, 'yyyy-MM-dd HH:mm:ss'),
    offset1: Number(offset1.toFixed(1)),
    offset2: Number(offset2.toFixed(1)),
    difference_hours: Number(difference.toFixed(1)),

    // === Clear direction info ===
    ahead: tz2IsAhead ? tz2 : tz1,
    behind: tz2IsBehind ? tz2 : tz1,
    hoursAhead: tz2IsAhead ? Math.abs(difference) : 0,
    hoursBehind: tz2IsBehind ? Math.abs(difference) : 0,

    // Conversion guide
    toConvertFromTz1ToTz2:
      difference > 0
        ? `Add ${difference.toFixed(1)} hours`
        : `Subtract ${Math.abs(difference).toFixed(1)} hours`,

    readable:
      difference === 0
        ? `${tz1} and ${tz2} are the same`
        : `${tz2} is ${Math.abs(difference).toFixed(1)} hours ${tz2IsAhead ? 'ahead of' : 'behind'} ${tz1}`,
  };
}

// Type Definition
export interface TimezoneDifferenceResult {
  timezone1: string;
  timezone2: string;
  time1: string;
  time2: string;
  offset1: number;
  offset2: number;
  difference_hours: number;
  ahead: string;
  behind: string;
  hoursAhead: number;
  hoursBehind: number;
  toConvertFromTz1ToTz2: string;
  readable: string;
}

export const calculateCanceledAtDueToTimezone = (
  isAhead: boolean,
  canceledAt?: number,
  difference_hours?: number,
) => {
  if (!canceledAt) return undefined;
  if (!difference_hours) return canceledAt;
  return isAhead
    ? subHours(canceledAt, difference_hours)
    : addHours(canceledAt, difference_hours);
};

export const generateRouteSheetHtml = (
  data: FunctionReturnType<typeof api.routeSheets.getRouteSheet> | undefined,
) => {
  if (!data) return '';

  return `
  <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Route Sheet</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      padding: 40px;
      max-width: 1200px;
      margin: 0 auto;
      background: #fff;
      color: #000;
    }

    .container {
      display: flex;
      flex-direction: column;
      gap: 32px;
    }

    .header-section {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .logo {
      width: 100px;
      height: 100px;
      margin: 0 auto;
      display: block;
    }

    .text-center {
      text-align: center;
    }

    .text-bold {
      font-weight: bold;
    }

    .text-medium {
      font-size: 20px;
    }

    .text-small {
      font-size: 16px;
      color: #666;
    }

    .text-normal {
      font-size: 15px;
    }

    .flex-text {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }

    .table-container {
      width: 100%;
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #ddd;
    }

    th, td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }

    th {
      background-color: #f5f5f5;
      font-weight: bold;
      font-size: 16px;
    }

    td {
      font-size: 16px;
    }

    .totals-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }

    .signature-section {
      border: 2px solid #000;
      padding: 20px;
      min-height: 100px;
      background: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .signature-image {
      max-width: 200px;
      max-height: 80px;
      margin-bottom: 20px;
    }

    .comment-section {
      margin-top: 8px;
    }

    .date-column {
      white-space: nowrap;
    }

    @media print {
      body {
        padding: 0;
      }

      .container {
        gap: 16px;
      }

      .header-section {
        gap: 12px;
      }

      table {
        width: 100%;
        page-break-inside: auto;
      }

      tr {
        page-break-inside: avoid;
        page-break-after: auto;
      }

      th, td {
        padding: 4px 6px;
        font-size: 10px;
      }

      .logo {
        width: 60px;
        height: 60px;
      }

      h1 { font-size: 14px; }
      p { font-size: 10px; }
      span { font-size: 10px; }
      
      @page {
        margin: 0.5cm;
        size: auto; 
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header Section -->
    <div class="header-section">
      <img src="https://pastel-albatross-709.convex.cloud/api/storage/8c5eaabd-2b0a-41c1-8ad8-dfb01505fa19" alt="Hospice Logo" class="logo">
      <h1 class="text-center text-bold text-medium">${
        data?.assignment.businessName
      }</h1>
      <p class="text-center text-small">${data?.assignment.hospiceAddress}</p>
      <p class="text-center text-normal">Route Sheet</p>
      <div class="flex-text">
        <span>Staff Name: ${data?.nurse.name}</span>
        <span>Discipline: ${data?.nurse.discipline}</span>
      </div>
    </div>

    <!-- Table Section -->
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th class="date-column">Date</th>
            <th>Patient Name</th>
            <th>Care level</th>
            <th>Time in</th>
            <th>Time out</th>
            <th>Hours worked</th>
            <th>Rate</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
           ${data?.schedules
             .map(
               (shift) => `
        <tr>
          <td class="date-column"> ${reverseDateStringToMDYShort(shift?.startDate)} - ${reverseDateStringToMDYShort(shift?.endDate)}</td>
          <td>${data?.assignment.patientFirstName} ${
            data?.assignment.patientLastName
          }</td>
          <td>${abbreviateCareLevel(data?.assignment.careLevel)}</td>
          <td>${shift.startTime}</td>
          <td>${shift.endTime}</td>
          <td>${calculateTotalHours([shift]).toFixed(2)}</td>
          <td>${shift.rate.toFixed(2)}</td>
          <td>$${(calculateTotalHours([shift]) * shift.rate || 0).toFixed(
            2,
          )}</td>
        </tr>
      `,
             )
             .join('')}
        </tbody>
      </table>
    </div>

    <!-- Totals Section -->
    <div class="totals-row">
      <p class="text-medium text-bold">Total hours: ${calculateTotalHours(
        data?.schedules || [],
      ).toFixed(2)}</p>
      <p class="text-medium text-bold">Total pay: $${data?.schedules
        .reduce(
          (acc, shift) =>
            acc +
            convertNumberToStringThenToNumber(calculateTotalHours([shift])) *
              shift.rate,
          0,
        )
        .toFixed(2)}</p>
    </div>

    <!-- Certification Text -->
    <p class="text-normal text-center">
      I certify the foregoing to be a correct accounting of time worked and services performed
    </p>

    <!-- Signature Section -->
    <div class="signature-section">
      <img src="${
        data?.routeSheet.signature
      }" class="signature-image" alt="Signature" width="200" height="100">
       <p class="text-normal"><strong>Date:</strong> ${
         data?.routeSheet &&
         format(data?.routeSheet._creationTime, 'MM/dd/yy HH:mm')
       }</p>
    </div>

    <!-- Comment Section -->
    <div class="comment-section">
      <p class="text-normal"><strong>Comment:</strong> ${
        data?.routeSheet.comment
      }</p>
    </div>
  </div>
</body>
</html>
  `;
};
