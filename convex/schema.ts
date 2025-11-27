import { authTables } from '@convex-dev/auth/server';
import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';
export const scheduleStatus = v.union(
  v.literal('completed'),
  v.literal('not_covered'),
  v.literal('booked'),
  v.literal('on_going'),
  v.literal('available'),
  v.literal('cancelled')
);
export const discipline = v.union(
  v.literal('RN'),
  v.literal('LVN'),
  v.literal('HHA')
);

export const careLevel = v.union(
  v.union(
    v.literal('Initial Evaluation'),
    v.literal('Follow Up'),
    v.literal('Continuous Care'),
    v.literal('Supervision'),
    v.literal('Recertification'),
    v.literal('Discharge')
  )
);

export const shifts = v.object({
  start: v.string(),
  end: v.string(),
  startShift: v.string(),
  endShift: v.string(),
});
export const hospiceSubscription = {
  hospiceId: v.id('hospices'),
  stripeCustomerId: v.string(),
  stripeSubscriptionId: v.string(),
  stripePriceId: v.string(),
  stripeCurrentPeriodEnd: v.number(),
};
export const Nurse = {
  name: v.string(),

  gender: v.string(),
  phoneNumber: v.string(),
  licenseNumber: v.string(),
  stateOfRegistration: v.string(),
  dateOfBirth: v.optional(v.string()),
  discipline: discipline,
  rate: v.optional(v.number()),
  imageId: v.optional(v.id('_storage')),
  isApproved: v.boolean(),
  userId: v.string(),
  address: v.optional(v.string()),
  zipCode: v.optional(v.string()),
};
const PendingNurse = {
  firstName: v.string(),
  lastName: v.string(),
  licenseNumber: v.string(),
  stateOfRegistration: v.string(),
  discipline: discipline,
  isApproved: v.boolean(),
  zipCode: v.optional(v.string()),
  nurseId: v.id('nurses'),
};
const NurseAssignments = {
  nurseId: v.id('nurses'),
  isCompleted: v.boolean(),
  assignmentId: v.id('assignments'),
  completedAt: v.optional(v.number()),
};

export const Hospice = {
  address: v.string(),
  businessName: v.string(),
  licenseNumber: v.string(),
  state: v.string(),
  approved: v.boolean(),
  userId: v.string(),
  faxNumber: v.optional(v.string()),
  phoneNumber: v.string(),
  email: v.string(),
  isApproved: v.boolean(),
  imageId: v.optional(v.id('_storage')),
};
const PendingHospice = {
  address: v.string(),
  businessName: v.string(),
  licenseNumber: v.string(),
  state: v.string(),
  faxNumber: v.optional(v.string()),
  phoneNumber: v.string(),
  email: v.string(),
  isApproved: v.boolean(),
  hospiceId: v.id('hospices'),
};

export const Schedule = {
  assignmentId: v.id('assignments'),
  status: scheduleStatus,
  nurseId: v.optional(v.id('nurses')),
  startTime: v.string(),
  endTime: v.string(),
  startDate: v.string(),
  endDate: v.string(),
  rate: v.number(),
  canceledAt: v.optional(v.number()),
  isEdited: v.optional(v.boolean()),
  isSubmitted: v.optional(v.boolean()),
};

export const gender = v.union(
  v.literal('male'),
  v.literal('female'),
  v.literal('others')
);

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
  zipcode: v.optional(v.string()),
  notes: v.optional(v.string()),
  status: v.union(
    v.literal('completed'),
    v.literal('not_covered'),
    v.literal('booked'),
    v.literal('available'),

    v.literal('cancelled')
  ),
  rate: v.number(),
  careLevel,
  isCanceled: v.optional(v.boolean()),
  canceledAt: v.optional(v.number()),
};
export const routeSheet = {
  nurseId: v.id('nurses'),
  hospiceId: v.id('hospices'),
  scheduleIds: v.array(v.id('schedules')),
  assignmentId: v.id('assignments'),
  isApproved: v.boolean(),
  isDeclined: v.optional(v.boolean()),
  isSeen: v.optional(v.boolean()),
  signature: v.string(),
  comment: v.optional(v.string()),
};
export const Rating = {
  nurseId: v.id('nurses'),
  rate: v.number(),
};
export const User = {
  name: v.optional(v.string()),
  image: v.optional(v.string()),
  imageId: v.optional(v.id('_storage')),
  email: v.optional(v.string()),
  emailVerificationTime: v.optional(v.number()),
  streamToken: v.optional(v.string()),
  phone: v.optional(v.string()),
  phoneVerificationTime: v.optional(v.number()),
  isAnonymous: v.optional(v.boolean()),
  isBoarded: v.boolean(),
  role: v.union(v.literal('nurse'), v.literal('hospice'), v.literal('admin')),
  userId: v.string(),
};
export const day = v.object({
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
});
export const days = v.array(day);

export const Availability = {
  nurseId: v.id('nurses'),
  days: days,
};
export const NurseNotification = {
  nurseId: v.id('nurses'),
  isRead: v.boolean(),
  type: v.union(
    v.literal('assignment'),
    v.literal('normal'),
    v.literal('admin')
  ),
  title: v.string(),
  description: v.optional(v.string()),
  hospiceId: v.optional(v.id('hospices')),
  scheduleId: v.optional(v.id('schedules')),
  status: v.optional(v.union(v.literal('accepted'), v.literal('declined'))),
};
export const HospiceNotification = {
  hospiceId: v.id('hospices'),
  isRead: v.boolean(),
  type: v.union(
    v.literal('case_request'),
    v.literal('route_sheet'),
    v.literal('cancel_request'),
    v.literal('admin'),
    v.literal('assignment')
  ),
  title: v.string(),
  description: v.optional(v.string()),
  routeSheetId: v.optional(v.id('routeSheets')),
  scheduleId: v.optional(v.id('schedules')),
  nurseId: v.optional(v.id('nurses')),
  status: v.optional(v.union(v.literal('accepted'), v.literal('declined'))),
};
export default defineSchema({
  ...authTables,
  users: defineTable(User).index('email', ['email']),
  nurses: defineTable(Nurse)
    .index('userId', ['userId'])
    .index('by_discipline', ['discipline', 'stateOfRegistration']),
  hospices: defineTable(Hospice).index('userId', ['userId']),
  assignments: defineTable(assignment)
    .index('state', ['state', 'status', 'discipline'])
    .index('hospiceId', ['hospiceId', 'status', 'discipline']),
  schedules: defineTable(Schedule)
    .index('nurse', ['nurseId', 'status'])
    .index('nurse_id', ['nurseId', 'assignmentId'])
    .index('by_assignment_id', [
      'assignmentId',
      'status',
      'nurseId',
      'isSubmitted',
    ]),
  routeSheets: defineTable(routeSheet).index('by_assignment_id', [
    'assignmentId',
    'nurseId',
    'hospiceId',
    'isApproved',
  ]),
  ratings: defineTable(Rating).index('nurseId', ['nurseId']),
  availabilities: defineTable(Availability).index('nurseId', ['nurseId']),
  nurseNotifications: defineTable(NurseNotification).index('by_nurseId', [
    'nurseId',
    'isRead',
  ]),
  hospiceNotifications: defineTable(HospiceNotification).index(
    'by_hospice_id',
    ['hospiceId', 'isRead']
  ),
  hospiceSubscriptions: defineTable(hospiceSubscription).index(
    'by_hospice_id',
    ['hospiceId']
  ),
  pendingNurseProfile: defineTable(PendingNurse).index('by_nurse_id', [
    'nurseId',
  ]),
  pendingHospiceProfile: defineTable(PendingHospice).index('by_hospice_id', [
    'hospiceId',
  ]),
  nurseAssignments: defineTable(NurseAssignments)
    .index('nurse_id', ['nurseId', 'isCompleted', 'assignmentId'])
    .index('assignmentId', ['assignmentId', 'nurseId']),
});
