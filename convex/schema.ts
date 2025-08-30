import { authTables } from '@convex-dev/auth/server';
import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';
export const scheduleStatus = v.union(
  v.literal('completed'),
  v.literal('not_covered'),
  v.literal('booked'),
  v.literal('available')
);
export const discipline = v.union(
  v.literal('RN'),
  v.literal('LVN'),
  v.literal('HHA')
);
export const Nurse = {
  firstName: v.string(),
  lastName: v.string(),
  gender: v.string(),
  phoneNumber: v.string(),
  licenseNumber: v.string(),
  stateOfRegistration: v.string(),
  dateOfBirth: v.string(),
  discipline: discipline,
  rate: v.optional(v.number()),
  imageId: v.optional(v.id('_storage')),
  isApproved: v.boolean(),
  userId: v.id('users'),
};

export const Hospice = {
  address: v.string(),
  state: v.string(),
  zipCode: v.string(),
  name: v.string(),
  licenseNumber: v.string(),
  stateOfRegistration: v.string(),
  approved: v.boolean(),
  userId: v.id('users'),
};

export const Schedule = {
  assignmentId: v.id('assignments'),
  status: scheduleStatus,
  nurseId: v.id('nurses'),
  startTime: v.string(),
  endTime: v.string(),
  startDate: v.string(),
  endDate: v.string(),
  rate: v.number(),
};

export const assignment = {
  hospiceId: v.id('hospices'),
  assignedTo: v.optional(v.id('nurses')),
  phoneNumber: v.string(),
  patientFirstName: v.string(),
  patientLastName: v.string(),
  gender: v.string(),
  dateOfBirth: v.string(),
  discipline: discipline,
  startDate: v.string(),
  endDate: v.string(),
  openShift: v.string(),
  patientAddress: v.string(),
  state: v.string(),
  zipCode: v.string(),
  notes: v.optional(v.string()),
};
export const routeSheet = {
  nurseId: v.id('nurses'),
  hospiceId: v.id('hospices'),
  scheduleId: v.array(v.id('schedules')),
};
export const Rating = {
  nurseId: v.id('nurses'),
  rate: v.number(),
  text: v.string(),
};
export const User = {
  name: v.optional(v.string()),
  image: v.optional(v.string()),
  email: v.optional(v.string()),
  emailVerificationTime: v.optional(v.number()),
  phone: v.optional(v.string()),
  phoneVerificationTime: v.optional(v.number()),
  isAnonymous: v.optional(v.boolean()),
  isBoarded: v.boolean(),
  isNurse: v.optional(v.boolean()),
};

export const days = v.array(
  v.object({
    day: v.union(
      v.literal('Monday'),
      v.literal('Tuesday'),
      v.literal('Wednesday'),
      v.literal('Thursday'),
      v.literal('Friday'),
      v.literal('Saturday'),
      v.literal('Sunday')
    ),
    startTime: v.optional(v.number()),
    endTime: v.optional(v.number()),
    available: v.boolean(),
  })
);

export const Availability = {
  nurseId: v.id('nurses'),
  days: days,
};
export default defineSchema({
  ...authTables,
  users: defineTable(User).index('email', ['email']),
  nurses: defineTable(Nurse).index('userId', ['userId']),
  hospices: defineTable(Hospice),
  assignments: defineTable(assignment),
  schedules: defineTable(Schedule),
  routeSheets: defineTable(routeSheet),
  ratings: defineTable(Rating),
  availabilities: defineTable(Availability).index('nurseId', ['nurseId']),
});
