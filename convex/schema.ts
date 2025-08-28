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
  email: v.string(),
  gender: v.string(),
  phoneNumber: v.string(),
  licenseNumber: v.string(),
  stateOfRegistration: v.string(),
  approved: v.boolean(),
  dateOfBirth: v.string(),
  discipline: discipline,
  rate: v.number(),
  startDate: v.string(),
  endDate: v.string(),
  openShift: v.string(),
  patientAddress: v.string(),
  state: v.string(),
  zipCode: v.string(),
  notes: v.optional(v.string()),
  imageId: v.optional(v.id('_storage')),
};

export const Hospice = {
  address: v.string(),
  state: v.string(),
  zipCode: v.string(),
  name: v.string(),
  licenseNumber: v.string(),
  stateOfRegistration: v.string(),
  approved: v.boolean(),
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

export default defineSchema({
  ...authTables,
  nurses: defineTable(Nurse),
  hospices: defineTable(Hospice),
  assignments: defineTable(assignment),
  schedules: defineTable(Schedule),
  routeSheets: defineTable(routeSheet),
  ratings: defineTable(Rating),
});
